import React, { useState, useCallback, useEffect } from 'react'
import { Page, Layout, Grid, Text, Button, Select, Checkbox, Toast, TextField, EmptySearchResult, IndexTable, Modal, Spinner, Icon, PageActions, Pagination, RadioButton, Badge, Card } from '@shopify/polaris';
import { DeleteMinor, SearchMinor } from '@shopify/polaris-icons';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { useNavigate, useParams } from 'react-router-dom'
import { ApiCall, GetApiCall } from '../../helper/axios'
import { useSelector } from 'react-redux';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

const IncrementalAmountDiscount = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const store_client_id = store_data?.shop_data?.store_client_id;
    const [collectionData, setCollectionData] = useState([]);
    const [saveActiveToast, setSaveActiveToast] = useState(false);
    const [loading, setLoading] = useState(id ? true : false);
    const [saveloading, setSaveLoading] = useState(false);
    const [collectionloader, setcollectionloader] = useState(false);
    const [deleteloading, setDeleteLoading] = useState(false);
    const [isDeleteReward, setIsDeleteReward] = useState(false);
    const [saveActiveToastMessage, setSaveActiveToastMessage] = useState('');
    const [Searchvalue, setSearchvalue] = useState('');
    const [datacollectionState, setdatacollectionState] = useState({
        collectionNext_Page: 1,
        collectionPeriousPage: 1,
        collectionNextCursor: '',
        collectionPreviousCursor: '',
        collectionData: [],
    });
    const [collectionRowsPerPage] = useState(10);
    const [collectionFilterDataCheck, setcollectionFilterDataCheck] = useState([]);
    const [collectionCurrentPage, setcollectionCurrentPage] = useState(1);
    const [WarnStatus, setWarnStatus] = useState({
        productdeleteWarnactive: false,
        productid: '',
        productindex: '',
        collectiondeleteWarnactive: false,
        collectionindex: '',
        collectionid: ''
    });
    const [initialState, setInitialState] = useState({
        title: '',
        customer_redeem_increment: '',
        customer_gets: '',
        applies_to: '1',
        certain_collection: '',
        min_requirement: '1',
        min_purchase_amount: '',
        expire_day: '',
        status: '1',
        icon_type: '1',
        is_min_amount: '2',
        min_amount: '',
        is_max_amount: '2',
        max_amount: '',

        statusapplycollectionvalue: [],
        statusapplayvalue: {},
        collectionState: {
            activecollectionModal: false,
            collectionSearchValue: '',
            collectiontablesearchValue: '',
            collectionidsmaindata: [],
            backupcollectionidsdata: [],
            collectiondeletebuttonLoader: false,
            removecollectionId: [],
            backupcollectionids: [],
            collectioncheckValues: false,
            perticularpagecollectiondata: [],
            collectiondeleteWarnactive: false,

            alreadySelectedStatusValue: {},
            collectionUsedData: []
        }
    });

    const toggleActive = useCallback(() => setSaveActiveToast((saveActiveToast) => !saveActiveToast), []);

    const toastMarkup = saveActiveToast ? (
        <Toast content={saveActiveToastMessage} onDismiss={toggleActive} />
    ) : null;

    const validationSchema = Yup.object().shape({
        title: Yup.string().nullable().required('Title is required'),
        customer_redeem_increment: Yup.number().nullable().min(1, "points must be greater than 0").required('points is required'),
        customer_gets: Yup.number().nullable().min(1, "value must be greater than 0").required('value is required'),
        min_amount: Yup.number().min(1, "Min Amount Must be greater than 0").when('is_min_amount', (is_min_amount, field) => is_min_amount[0] === '1' ? field.required('Min amount is required').test({
            test(value) {
                const parent = this.options.parent
                if (value !== undefined) {
                    if (parent) {
                        return parseInt(value) >= parseInt(parent.customer_redeem_increment) || this.createError({
                            message: `Minimum points must be ${parent.customer_redeem_increment} or greater`
                        });
                    } else {
                        return true
                    }
                } else {
                    return true
                }
            }
        }).test({
            test(value) {
                if (value !== undefined) {
                    const parent = this.options.parent.customer_redeem_increment
                    if (parent) {
                        const parentdived = parent / 2
                        const addparent = parent + parentdived
                        const cal = value % parent
                        if (cal !== 0) {
                            if (value <= addparent) {
                                const divide = Math.floor(value / parent)
                                const multiple = parent * divide
                                return this.createError({
                                    message: `Minimum points must be in increments of ${parent}. Did you mean ${multiple} points?`
                                });
                            } else {
                                const divide = Math.ceil(value / parent)
                                const multiple = parent * divide
                                return this.createError({
                                    message: `Minimum points must be in increments of ${parent}. Did you mean ${multiple} points?`
                                });

                            }
                        } else {
                            return true
                        }

                    } else {
                        return true
                    }
                } else {
                    return true
                }


            }
        }) : field),
        max_amount: Yup.number().min(1, "Mix Amount Must be greater than 0").when('is_max_amount', (is_max_amount, field) => is_max_amount[0] === '1' ? field.required('Max amount is required').test({
            test(value) {
                const parent = this.options.parent
                if (value !== undefined) {
                    if (parent) {
                        if (parent.is_min_amount === '1' && parent.min_amount !== undefined) {
                            return parseInt(value) >= parseInt(parent.min_amount) || this.createError({
                                message: `Max for points exchange must be equal or greater than  the min`
                            });
                        } else {
                            return true
                        }

                    } else {
                        return true
                    }
                } else {
                    return true
                }
            }
        }) : field),
        min_purchase_amount: Yup.number().min(1, "Min purchase is greater than 0").when('min_requirement', (min_requirement, field) => min_requirement[0] === '2' ? field.required('Min purchase amount is required') : field),
        expire_day: Yup.number().nullable().required('Days is required').min(1, "Expiry day must be greater than 0"),
        // certain_collection: Yup.string().when('applies_to', (applies_to, field) => applies_to[0] === '2' ? field.required('certain collection is required') : field),
        statusapplycollectionvalue: Yup.array().when('applies_to', (applies_to, field) => applies_to[0] === '2' ? field.min(1, 'please select atleast one collection') : field)
    })
    const formik = useFormik({
        initialValues: initialState,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setSaveLoading(true);
            const data = {
                store_client_id: store_client_id,
                title: values.title,
                customer_redeem_increment: parseFloat(values.customer_redeem_increment),
                customer_gets: parseFloat(values.customer_gets),
                applies_to: values.applies_to,
                ...(values.applies_to) === '2' && { collection_id: `${values.statusapplycollectionvalue[0]}` },
                incremental_set_min_amount: values.is_min_amount,
                ...(values.is_min_amount) === '1' && { incremental_min_amount: parseFloat(values.min_amount) },
                incremental_set_max_amount: values.is_max_amount,
                ...(values.is_max_amount) === '1' && { incremental_max_amount: parseFloat(values.max_amount) },
                minimum_requirement: values.min_requirement,
                ...(values.min_requirement) === '2' && { minimum_purchase_amount: parseFloat(values.min_purchase_amount) },
                expire_day: parseFloat(values.expire_day),
                reward_status: values.status,
            }
            if (!id) {
                const res = await ApiCall('POST', '/incremental_amount_discount', data, { authentication: token });
                if (res.data.status === 'SUCCESS' && res.status === 200) {
                    setSaveActiveToastMessage(res.data.message);
                    toggleActive();
                    setTimeout(() => {
                        navigate('/redeem-points');
                    }, 1000)
                }
            } else {
                data.id = parseInt(id);
                const res = await ApiCall('PUT', '/update_incremental_amount_discount', data, { authentication: token });
                if (res.data.status === 'SUCCESS' && res.status === 200) {
                    setSaveActiveToastMessage(res.data.message);
                    toggleActive();
                    setTimeout(() => {
                        navigate('/redeem-points');
                    }, 1000)
                }
            }
        }
    });
    const Getcollection = async (value, pagequery, cursor) => {
        let url = '/get_all_collection?page_query=after';
        const pagecursor = !cursor ? '' : cursor;
        const pagequerydata = !pagequery ? 'after' : pagequery;
        if (value && value.length >= 3) {
            url = `/get_all_collection?page_query=${pagequerydata}&search_key=${value}`;
        }
        const urldata = !value ? !pagecursor ? `/get_all_collection?page_query=${pagequerydata}` : `/get_all_collection?page_query=${pagequerydata}&cursor=${pagecursor}` : url;
        const res = await GetApiCall('GET', urldata, { authentication: token });
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const data = res.data.data;
            setCollectionData(data.collections);

            const dataCollection = { ...datacollectionState };

            dataCollection.collectionNext_Page = res.data.data.is_next_page;
            dataCollection.collectionPeriousPage = res.data.data.is_previous_page;
            dataCollection.collectionNextCursor = res.data.data.nxt_page_cursor;
            dataCollection.collectionPreviousCursor = res.data.data.prev_page_cursor;
            dataCollection.collectionData = res.data.data?.collections;

            setdatacollectionState(dataCollection);
            setcollectionloader(false);
        } else {
            const data = { ...datacollectionState };
            data.collectionData = [];
            setdatacollectionState(data);
            setcollectionloader(false);
        }
    }

    const GetAmountData = async () => {
        setLoading(true);
        const res = await GetApiCall('GET', `/incre_Amount_Discount_get/${id}`, { authentication: token });
        if (res.data.status === "SUCCESS" && res.status === 200) {
            const detailData = res.data.data.checkStore;
            const collectionDatas = res.data.data.collectionData;
            const data = { ...initialState };
            data.title = detailData.title
            data.applies_to = detailData.applies_to
            if (detailData.applies_to === '2') {
                data.statusapplycollectionvalue = [detailData.collection_id]
                const obj = {
                    title: collectionDatas.title,
                    collectionid: collectionDatas.id
                }
                data.collectionState.collectionidsmaindata = [obj]
                data.collectionState.backupcollectionidsdata = [obj]
            }
            data.customer_gets = detailData.customer_gets
            data.customer_redeem_increment = detailData.customer_redeem_increment
            data.min_requirement = detailData.minimum_requirement
            if (detailData.minimum_requirement === '2') {
                data.min_purchase_amount = detailData.minimum_purchase_amount
            }
            data.is_min_amount = detailData.incremental_set_min_amount
            if (detailData.incremental_set_min_amount === '1') {
                data.min_amount = detailData.incremental_min_amount
            }
            data.is_max_amount = detailData.incremental_set_max_amount
            if (detailData.incremental_set_max_amount === '1') {
                data.max_amount = detailData.incremental_max_amount
            }
            data.expire_day = detailData.expire_day
            data.status = detailData.reward_status
            data.icon_type = detailData.icon
            setInitialState(data);
            GetUsedCollectionData(data.statusapplycollectionvalue);
            setLoading(false);
        } else {
            setLoading(false);
            setSaveActiveToastMessage('Something went wrong');
            toggleActive();
            GetUsedCollectionData([]);
        }

    }

    const GetUsedCollectionData = async (statusapplycollectionvalue) => {
        /* const type = 2;
        let res = await GetApiCall('GET', `/get_store_all_collection/${type}`, { authentication: token });
        if (res.data.status === 'SUCCESS' && res.status === 200) {
            const detailsData = res.data.data;
            const finalData = id ? statusapplycollectionvalue : formik.values.statusapplycollectionvalue;
            const arr = []
            detailsData.map((item) => {
                const collectionId = item.result.collection.id.slice(25)
                if (!finalData.includes(collectionId)) {
                    arr.push(collectionId)
                }
            })
            formik.setFieldValue('collectionState.collectionUsedData', arr)
            // setInitialState({ ...initialState, collectionState: { ...initialState.collectionState, collectionUsedData: detailsData } })
        } */
    }

    const fetchData = async () => {
        await Getcollection();
        handlecollectiondata();
        if (id) {
            GetAmountData();
        } else {
            GetUsedCollectionData();
        }
    }

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const handleallcollectionsearch = (value) => {
        formik.setFieldValue('collectionState.collectionSearchValue', value);
        if (value && value.length >= 3) { Getcollection(value); }
        if (value === '') { Getcollection(value); }
    };

    const handlecollectionmodal = (activepopup) => {
        formik.setFieldValue('collectionState.activecollectionModal', activepopup);
        formik.setFieldValue('collectionState.alreadySelectedStatusValue', formik.values.statusapplycollectionvalue);
    }

    const selectedcollectionemptyStateMarkup = (
        <EmptySearchResult
            title={'collection not found'}
            description={'Try changing the search term'}
            withIllustration
        />
    );

    const handleChangeCollectionCheckbox = (id) => {
        // formik.setFieldTouched('collectionState.collectionidsmaindata', true);
        const deletedId = [...formik.values.collectionState.removecollectionId];
        const array = [];
        if (array.includes(id)) {
            deletedId.push(id);
            const index = array.indexOf(id);
            array.splice(index, 1);
        } else {
            array.push(id);
        }
        formik.setFieldValue('statusapplycollectionvalue', array);
        formik.setFieldValue('collectionState.removecollectionId', deletedId);
    };

    const allcollectionmarkup = datacollectionState.collectionData && datacollectionState.collectionData.length > 0 ? datacollectionState.collectionData?.map(
        (ite, i) => [
            <IndexTable.Row key={i}>
                <div className={!formik.values.collectionState.collectionUsedData.includes(ite?.node?.id.slice(25)) ? 'IndexTableCell' : 'IndexTableProduct'} onClick={() => {
                    if (!formik.values.collectionState.collectionUsedData.includes(ite?.node?.id.slice(25))) {
                        handleChangeCollectionCheckbox((ite?.node?.id).slice(25))
                    }
                }}>
                    <IndexTable.Cell>
                        <div className='productdata'>
                            <RadioButton
                                checked={formik.values.statusapplycollectionvalue?.includes((ite?.node?.id).slice(25))}
                                name="collections"
                                id={(ite?.node?.id).slice(25)}
                                disabled={!(formik.values.collectionState.collectionUsedData.includes(ite?.node?.id.slice(25))) ? false : true}
                            />
                            <div>
                                <p>{ite?.node?.title}</p>
                            </div>
                        </div>
                    </IndexTable.Cell>
                    {formik.values.collectionState.collectionUsedData.includes(ite?.node?.id.slice(25)) ? <span className='soldoutbadge'> <Badge tone="info" >Selected</Badge></span> : <></>}
                </div>
            </IndexTable.Row>
        ]
    ) : [];

    const handlecollectiondata = () => {
        const olddata = [...formik.values.collectionState.perticularpagecollectiondata];
        const collectionids = datacollectionState.collectionData.filter((item) => {
            return (
                formik.values.statusapplycollectionvalue.includes((item?.node?.id).slice(25)) &&
                item
            );
        });
        const newdata = [];
        const dataSet = new Set();
        for (const data of [...olddata, ...collectionids]) {
            if (!dataSet.has(data.cursor)) {
                newdata.push(data);
                dataSet.add(data.cursor);
            }
        }
        formik.setFieldValue('collectionState.perticularpagecollectiondata', newdata);

    };

    const handlecollectiondeletewarn = (collectionid, index) => {
        const data = { ...WarnStatus };
        data.collectionid = collectionid;
        data.collectionindex = index;
        data.collectiondeleteWarnactive = !data.collectiondeleteWarnactive;
        setWarnStatus(data);
    };

    const deletecollections = (collectionid, collectionindex) => {
        collectionid = `${collectionid}`
        const newcollectionids = [...formik.values.statusapplycollectionvalue];
        const index = newcollectionids.indexOf(collectionid.includes('gid') ? (collectionid).slice(25) : collectionid);
        newcollectionids.splice(index, 1);
        formik.setFieldValue('statusapplycollectionvalue', newcollectionids);
        const newdata = [...formik.values.collectionState.collectionidsmaindata];
        const deleteddata = newdata.splice(collectionindex, 1);
        formik.setFieldValue('collectionState.collectionidsmaindata', newdata);
        formik.setFieldValue('collectionState.collectiondeletebuttonLoader', false);
        const backupcollectionidsnewdata = [];
        formik.values.collectionState.backupcollectionidsdata.map((data) => {
            if (data.collectionid !== deleteddata[0].collectionid) {
                backupcollectionidsnewdata.push(data);
            }
            return backupcollectionidsnewdata;
        }
        );
        formik.setFieldValue('collectionState.backupcollectionidsdata', backupcollectionidsnewdata);

    };

    const selectedCollectionRowMarkup = formik.values.collectionState.collectionidsmaindata && formik.values.collectionState.collectionidsmaindata.length ? formik.values.collectionState.collectionidsmaindata.map(
        (data, index) => (
            <IndexTable.Row id={index} key={index} position={index}>
                <IndexTable.Cell>
                    <div className='productlistingtable'>
                        <div className='collectionthumbnail'>
                            <p>{data?.title}</p>

                        </div>
                        <div className='productActionBtn'>
                            <span
                                onClick={() => {
                                    handlecollectiondeletewarn(data?.collectionid, index);
                                }}
                            > <Icon
                                    source={DeleteMinor}
                                    color="base"
                                />
                            </span>
                        </div>
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    ) : [];

    const collectionDelete = () => {
        handlecollectiondeletewarn();
        formik.setFieldValue('collectionState.collectiondeletebuttonLoader', true);
        deletecollections(WarnStatus.collectionid, WarnStatus.collectionindex);
    };

    const collectioncancelbtn = () => {
        formik.setFieldValue('statusapplycollectionvalue', formik.values.collectionState.alreadySelectedStatusValue);
        formik.setFieldValue('collectionState.activecollectionModal', false);
        if (formik.values.collectionState.collectionSearchValue && formik.values.collectionState.collectionSearchValue.length) {
            Getcollection();
        }
        formik.setFieldValue('collectionState.collectionSearchValue', '');
        formik.setFieldValue('collectionState.removecollectionId', []);
        if (formik.values.collectionState.collectiontablesearchValue.length === 1) {
            formik.setFieldValue('collectionState.collectiontablesearchValue', '');
        }
    };

    const collectionTotalPages = Math.ceil(selectedCollectionRowMarkup.length / collectionRowsPerPage);
    const getItemsForCollection = (page) => {
        let pageNumber = page;
        if (formik.values.collectionState.collectiontablesearchValue && formik.values.collectionState.collectiontablesearchValue.length >= 3) {
            if (collectionCurrentPage > 1 && collectionFilterDataCheck === 1) {
                pageNumber = 1;
                setcollectionCurrentPage(1);
                setcollectionFilterDataCheck(0);
            }
        }
        const startIndex = (pageNumber - 1) * collectionRowsPerPage;
        const endIndex = startIndex + collectionRowsPerPage;
        const currentArray = selectedCollectionRowMarkup;
        return currentArray.slice(startIndex, endIndex);
    };
    let collectionToDisplay = getItemsForCollection(collectionCurrentPage);
    if ((collectionToDisplay.length === 0) && collectionCurrentPage > 1) {
        collectionToDisplay = getItemsForCollection(1);
        setcollectionCurrentPage(1);
    }

    const handlesearchfromcollectiondata = (value) => {
        formik.setFieldValue('collectionState.collectiontablesearchValue', value);
        if (value && formik.values.collectionState.backupcollectionidsdata.length === 0) {
            handlecollectionmodal(true);
            formik.setFieldValue('collectionState.collectionSearchValue', value);
        } else {
            if (value && value.length >= 3) {
                const array = formik.values.collectionState.collectiontablesearchValue !== value ? formik.values.collectionState.backupcollectionidsdata : formik.values.collectionState.collectionidsmaindata;
                const filterdata = array.filter((data) => {
                    let valuestobereturn;
                    if ((data?.firstName && (data?.firstName.includes(value))) || (data?.lastName && (data?.lastName.includes(value))) || (data?.email && (data?.email.includes(value)))) {
                        valuestobereturn = data;
                    }
                    return valuestobereturn;
                });
                formik.setFieldValue('collectionState.collectionidsmaindata', filterdata);
            } else {
                formik.setFieldValue('collectionState.collectionidsmaindata', formik.values.collectionState.backupcollectionidsdata);
            }
        }
    };

    const addcollection = () => {
        formik.setFieldValue('collectionState.collectiontablesearchValue', '');
        const mainarray = [];
        let collectionDataObjects = {};
        const oldData = [];
        const collectionid = datacollectionState.collectionData.filter((item) => {
            return (
                formik.values.statusapplycollectionvalue.includes((item?.node?.id).slice(25)) &&
                item
            );
        });
        const perpagedata = [];
        const perpagedatacursorSet = new Set();
        for (const data of [...formik.values.collectionState.perticularpagecollectiondata, ...collectionid]) {
            if (!perpagedatacursorSet.has(data.node.id)) {
                perpagedata.push(data);
                perpagedatacursorSet.add(data.node.id);
            }
        }

        if (perpagedata && perpagedata.length) {
            perpagedata.map(
                (data) => {
                    collectionDataObjects = {
                        title: data?.node?.title,
                        collectionid: data?.node?.id
                    };
                    mainarray.push(collectionDataObjects);
                    return collectionDataObjects;
                });
        }
        const mergedData = Array.from(new Set([...oldData, ...mainarray].map(obj => obj['collectionid']))
        ).map(uniqueKey => oldData.concat(mainarray).find(obj => obj['collectionid'] === uniqueKey));
        formik.setFieldValue('collectionState.collectionidsmaindata', mergedData);
        formik.setFieldValue('collectionState.backupcollectionidsdata', mergedData);
        formik.setFieldValue('collectionState.activecollectionModal', false);
        if (formik.values.collectionState.removecollectionId.length) {
            const updatedRemoveProductId = formik.values.collectionState.removecollectionId.filter(id => !formik.values.statusapplycollectionvalue.includes(id));
            const difference = mergedData.filter(x => !updatedRemoveProductId.includes(x.collectionid));
            formik.setFieldValue('collectionState.collectionidsmaindata', difference);
            formik.setFieldValue('collectionState.backupcollectionidsdata', difference);

            formik.setFieldValue('collectionState.removecollectionId', []);
        }
        formik.setFieldValue('collectionState.perticularpagecollectiondata', []);
        formik.setFieldValue('collectionState.collectionSearchValue', '');
        if (formik.values.collectionState.collectionSearchValue) {
            Getcollection();
        }
    };

    const deleteReward = async (id) => {
        setDeleteLoading(true);
        const res = await ApiCall('DELETE', '/delete_incremental_amount_discount', { id: parseInt(id) }, { authentication: token });
        if (res.data.status === 'SUCCESS' && res.status === 200) {
            setTimeout(() => {
                navigate('/redeem-points');
            }, 1000)
        } else {
            setDeleteLoading(false);
        }
        setSaveActiveToastMessage(res.data.message);
        toggleActive();
        handleDeleteReward();
    }

    const handleDeleteReward = (flag) => {
        if (flag === true) {
            deleteReward(id);
        } else {
            setIsDeleteReward(!isDeleteReward);
        }
    };

    let redeemPointsBreadcrumb = {};
    if (process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my')) {
        redeemPointsBreadcrumb = AppButton.create(BridgeApp, { label: 'Redeem points' });
        redeemPointsBreadcrumb.subscribe(AppButton.Action.CLICK, () => {
            BridgeApp.dispatch(Redirect.toApp({ path: '/redeem-points' }));
        });
    }

    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                <TitleBar title='Incremental Amount Discount' breadcrumbs={redeemPointsBreadcrumb} />
            </Provider> : <></>}
            {!loading ? <div className='fix-amount-discount-page amount-pages'>
                <Page title='Incremental Amount Discount' backAction={{ content: 'Products', onAction: () => navigate('/redeem-points') }} primaryAction={{ primary: true, content: 'Save', loading: saveloading, disabled: !formik.dirty, onAction: formik.handleSubmit }}>
                    <Layout>
                        <Layout.Section>
                            <div className='pb-3'>
                                <Card>
                                    <div className=''>
                                        <TextField
                                            label="Title"
                                            type="text"
                                            value={formik.values.title}
                                            onChange={(value) => { formik.setFieldValue('title', value) }}
                                            onBlur={() => formik.setFieldTouched('title')}
                                            error={formik.touched.title && formik.errors.title ? formik.errors.title : ''}
                                            autoComplete="off"
                                        />
                                    </div>
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Reward value
                                    </h6>
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                            <div className=''>
                                                <TextField
                                                    label="Customer redeems increment of"
                                                    type="number"
                                                    suffix="ponits"
                                                    min={0}
                                                    placeholder='e.g. 100'
                                                    value={formik.values.customer_redeem_increment}
                                                    onChange={(value) => { formik.setFieldValue('customer_redeem_increment', value) }}
                                                    onBlur={() => formik.setFieldTouched('customer_redeem_increment')}
                                                    error={formik.touched.customer_redeem_increment && formik.errors.customer_redeem_increment ? formik.errors.customer_redeem_increment : ''}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                            <div className=''>
                                                <TextField
                                                    label="Customer gets"
                                                    type="number"
                                                    prefix="RM"
                                                    placeholder='e.g. 100'
                                                    min={0}
                                                    value={formik.values.customer_gets}
                                                    onChange={(value) => { formik.setFieldValue('customer_gets', value) }}
                                                    onBlur={() => formik.setFieldTouched('customer_gets')}
                                                    error={formik.touched.customer_gets && formik.errors.customer_gets ? formik.errors.customer_gets : ''}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
                                    <Checkbox
                                        label="Set a minimum amount of points required to redeem this reward"
                                        checked={formik.values.is_min_amount === '1'}
                                        onChange={() => { formik.setFieldValue('is_min_amount', formik.values.is_min_amount === '1' ? '2' : '1'); if (formik.values.is_min_amount === '1') { formik.setFieldTouched('min_amount', false); } }}
                                    />
                                    {formik.values.is_min_amount === '1' && <div className='margin-left-input'>
                                        <TextField
                                            type="number"
                                            suffix="Points"
                                            value={formik.values.min_amount}
                                            step={formik.values.customer_redeem_increment ? formik.values.customer_redeem_increment : 1}
                                            placeholder='e.g. 100'
                                            min={formik.values.customer_redeem_increment}
                                            onChange={(value) => { formik.setFieldValue('min_amount', value) }}
                                            onBlur={() => formik.setFieldTouched('min_amount')}
                                            error={formik.touched.min_amount && formik.errors.min_amount ? formik.errors.min_amount : ''}
                                            autoComplete="off"
                                        />
                                    </div>}
                                    <Checkbox
                                        label="Set a maximum amount of points the customer can spend on this reward"
                                        checked={formik.values.is_max_amount === '1'}
                                        onChange={() => { formik.setFieldValue('is_max_amount', formik.values.is_max_amount === '1' ? '2' : '1'); if (formik.values.is_max_amount === '1') { formik.setFieldTouched('max_amount', false); } }}
                                    />
                                    {formik.values.is_max_amount === '1' && <div className='margin-left-input'>
                                        <TextField
                                            type="number"
                                            suffix="Points"
                                            min={0}
                                            placeholder='e.g 1000'
                                            value={formik.values.max_amount}
                                            onChange={(value) => { formik.setFieldValue('max_amount', value) }}
                                            onBlur={() => formik.setFieldTouched('max_amount')}
                                            error={formik.touched.max_amount && formik.errors.max_amount ? formik.errors.max_amount : ''}
                                            autoComplete="off"
                                        />
                                    </div>}
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Applies to
                                    </h6>
                                    <div className='d-block'>
                                        <RadioButton
                                            label="Entire order"
                                            checked={formik.values.applies_to === '1'}
                                            id="applies_to_1"
                                            name="applies_to"
                                            onChange={() => { formik.setFieldValue('applies_to', '1') }}
                                        /><br />
                                        <RadioButton
                                            label="Certain collection"
                                            id="applies_to_2"
                                            name="applies_to"
                                            checked={formik.values.applies_to === '2'}
                                            onChange={() => { formik.setFieldValue('applies_to', '2') }}
                                        />
                                        {formik.values.applies_to === '2' && <div className='margin-left-input'>
                                            {/* <Select
                                        options={options}
                                        onChange={(value) => formik.setFieldValue('certain_collection', value)}
                                        value={formik.values.certain_collection}
                                    /> */}
                                            {/* <Autocomplete
                                        options={filterColoptions}
                                        selected={formik.values.certain_collection}
                                        onSelect={updateSelection}
                                        textField={textField}
                                    /> */}

                                            <TextField
                                                value={Searchvalue}
                                                placeholder='Search'
                                                autoComplete='off'
                                                onChange={(value) => { handlesearchfromcollectiondata(value) }}
                                                connectedRight={
                                                    <Button size='large' onClick={() => handlecollectionmodal(true)}>Browse</Button>
                                                }
                                            />

                                            <div className='indextable'>
                                                {
                                                    (formik.values.collectionState.collectionidsmaindata && formik.values.collectionState.collectionidsmaindata.length) || formik.values.collectionState.collectiontablesearchValue ? <>
                                                        <IndexTable
                                                            itemCount={formik.values.collectionState.collectionidsmaindata.length}
                                                            selectable={false}
                                                            emptyState={formik.values.collectionState.backupcollectionidsdata.length !== 0 ? selectedcollectionemptyStateMarkup : []}
                                                            headings={[{ title: 'Title' }]}
                                                        >
                                                            {collectionToDisplay}
                                                        </IndexTable>
                                                        {collectionTotalPages > 1 ? <div className='productData-pagination'>
                                                            <Pagination
                                                                previousTooltip="Previous"
                                                                nextTooltip='Next'
                                                                hasPrevious={collectionCurrentPage > 1}
                                                                onPrevious={() => { setcollectionCurrentPage(parseInt(collectionCurrentPage) - 1); }}
                                                                hasNext={collectionCurrentPage < collectionTotalPages}
                                                                onNext={() => { setcollectionCurrentPage(parseInt(collectionCurrentPage) + 1); }}
                                                            />
                                                        </div> : ''}
                                                    </> : ''
                                                }
                                            </div>
                                            {formik.errors?.statusapplycollectionvalue && formik.touched?.statusapplycollectionvalue && <div class="Polaris-Labelled__Error">
                                                <div id=":r0:Error" class="Polaris-InlineError">
                                                    <div class="Polaris-InlineError__Icon">
                                                        <span class="Polaris-Icon">
                                                            <span class="Polaris-Text--root Polaris-Text--visuallyHidden"></span>
                                                            <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                <path d="M10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"></path>
                                                                <path d="M11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
                                                                <path fill-rule="evenodd" d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"></path>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    {formik.errors.statusapplycollectionvalue}
                                                </div>
                                            </div>}
                                        </div>}
                                    </div>
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Minimum requirement
                                    </h6>
                                    <div className='d-block'>
                                        <RadioButton
                                            label="None"
                                            checked={formik.values.min_requirement === '1'}
                                            id="min_requirement_1"
                                            name="min_requirement"
                                            onChange={() => { formik.setFieldValue('min_requirement', '1') }}
                                        /><br />
                                        <RadioButton
                                            label="Minimum purchase amount"
                                            checked={formik.values.min_requirement === '2'}
                                            id="min_requirement_2"
                                            name="min_requirement"
                                            onChange={() => { formik.setFieldValue('min_requirement', '2') }}
                                        />
                                        {formik.values.min_requirement === '2' && <div className='margin-left-input'>
                                            <TextField
                                                type="number"
                                                suffix="RM"
                                                min={0}
                                                placeholder='e.g. 100'
                                                value={formik.values.min_purchase_amount}
                                                onChange={(value) => { formik.setFieldValue('min_purchase_amount', value) }}
                                                onBlur={() => formik.setFieldTouched('min_purchase_amount')}
                                                error={formik.touched.min_purchase_amount && formik.errors.min_purchase_amount ? formik.errors.min_purchase_amount : ''}
                                                autoComplete="off"
                                            />
                                        </div>}
                                    </div>
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Discount has expiry of x days
                                    </h6>
                                    <div className=''>
                                        <TextField
                                            label="X days"
                                            min={0}
                                            placeholder='e.g. 10'
                                            type="number"
                                            value={formik.values.expire_day}
                                            onChange={(value) => { formik.setFieldValue('expire_day', value) }}
                                            onBlur={() => formik.setFieldTouched('expire_day')}
                                            error={formik.touched.expire_day && formik.errors.expire_day ? formik.errors.expire_day : ''}
                                            autoComplete="off"
                                        />
                                    </div>
                                </Card>
                            </div>
                        </Layout.Section>
                        <Layout.Section variant="oneThird">
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Status
                                    </h6>
                                    <div className='d-block'>
                                        <RadioButton
                                            label="Active"
                                            checked={formik.values.status === '1'}
                                            id="status_1"
                                            name="status"
                                            onChange={() => { formik.setFieldValue('status', '1') }}
                                        /><br />
                                        <RadioButton
                                            label="Disabled"
                                            checked={formik.values.status === '2'}
                                            id="status_2"
                                            name="status"
                                            onChange={() => { formik.setFieldValue('status', '2') }}
                                        />
                                    </div>
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Icon
                                    </h6>
                                    <div className='d-block'>
                                        <RadioButton
                                            label="Default"
                                            checked={formik.values.icon_type === '1'}
                                            id="icon_type_1"
                                            name="icon_type"
                                            onChange={() => { formik.setFieldValue('icon_type', '1') }}
                                        />
                                        <div class="Polaris-ChoiceList__ChoiceChildren">
                                            <span class="Polaris-Thumbnail  Polaris-Thumbnail--sizeMedium">
                                                <img className="Polaris-Thumbnail__Image" src={`https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg?theme=light&amp;color=%236568FE`} alt='demo' />
                                            </span>
                                        </div>
                                    </div>
                                    <div className='learn-more-customers'>
                                        <Text as="h2" variant="bodyMd">
                                            This is what your customers will see in UI Learn more about how customers discover rewards.
                                        </Text>
                                    </div>
                                </Card>
                                {toastMarkup}
                            </div>
                        </Layout.Section>
                    </Layout>
                    <div className="collectionmodal">
                        <Modal
                            open={formik.values.collectionState.activecollectionModal}
                            onClose={() => {
                                formik.setFieldValue('collectionState.activecollectionModal', false);
                                // handleproductmodalclose();
                            }}
                            title="Specific collection"
                            onTransitionEnd={() => {
                                formik.setFieldValue('collectionState.backupcollectionids', JSON.parse(JSON.stringify(formik.values.statusapplayvalue)));
                                formik.setFieldValue('collectionState.collectioncheckValues', false);
                            }}
                            primaryAction={{
                                content: 'Done',
                                onAction: () => addcollection(),
                            }}
                            secondaryActions={[
                                {
                                    content: 'Cancel',
                                    onAction: () => collectioncancelbtn(),
                                },
                            ]}
                            footer={
                                (!datacollectionState.collectionData && (formik.values.collectionState.collectionSearchValue === '' || formik.values.collectionState.collectionSearchValue?.length >= 0)) ? (<></>) : (
                                    <div>
                                        <div className='footercontect'>
                                            <div className='paginationContent'>
                                                {datacollectionState.collectionData.length > 9 && (datacollectionState.collectionPeriousPage === 1 || datacollectionState.collectionNext_Page === 1) ? (
                                                    <>
                                                        <Pagination
                                                            previousTooltip="Previous"
                                                            nextTooltip='Next'
                                                            hasPrevious={datacollectionState.collectionPeriousPage > 0}
                                                            onPrevious={() => {
                                                                Getcollection(formik.values.collectionState.collectionSearchValue, 'before', datacollectionState.collectionPreviousCursor);
                                                                handlecollectiondata();
                                                                setcollectionloader(true);
                                                            }}
                                                            hasNext={datacollectionState.collectionNext_Page >= 1}
                                                            onNext={() => {
                                                                Getcollection(formik.values.collectionState.collectionSearchValue, 'after', datacollectionState.collectionNextCursor);
                                                                handlecollectiondata();
                                                                setcollectionloader(true);
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                )
                            }
                        >
                            <Modal.Section>
                                <div className="productcontentsection">
                                    <div className="productsearchfield">
                                        <TextField prefix={<Icon
                                            source={SearchMinor}
                                        />}
                                            value={formik.values.collectionState.collectionSearchValue}
                                            placeholder='Search'
                                            autoComplete='off'
                                            onChange={(value) => { handleallcollectionsearch(value); handlecollectiondata(); }}
                                            onClearButtonClick={() => {
                                                formik.setFieldValue('collectionState.collectionSearchValue', '');
                                                Getcollection();
                                            }}
                                        />
                                    </div>
                                    <div className="producttable">
                                        {!collectionloader ? <IndexTable
                                            itemCount={datacollectionState.collectionData.length}
                                            headings={[[]]}
                                            selectable={false}
                                            emptyState={selectedcollectionemptyStateMarkup}
                                        >
                                            {allcollectionmarkup}
                                        </IndexTable> : <div className="page_loader" key="loader">
                                            <Spinner size="large" />
                                        </div>}
                                    </div>
                                </div>


                            </Modal.Section>
                        </Modal>
                        <div className="collectiondeletemodal">
                            <Modal
                                open={WarnStatus.collectiondeleteWarnactive}
                                onClose={handlecollectiondeletewarn}
                                title='Delete collection'
                                primaryAction={{
                                    content: 'Delete',
                                    onAction: collectionDelete,
                                    destructive: true,
                                    loading: formik.values.collectionState.collectiondeletebuttonLoader
                                }}
                                secondaryActions={[
                                    {
                                        content: 'Cancel',
                                        onAction: handlecollectiondeletewarn
                                    }
                                ]}
                            >
                                <Modal.Section>
                                    <Text>Are you sure, you want to delete this collection </Text>
                                </Modal.Section>
                            </Modal>
                        </div>
                    </div>
                    <div className="deleteFixAmountModel">
                        <Modal
                            open={isDeleteReward}
                            onClose={handleDeleteReward}
                            title={`Delete ${formik.values.title} ?`}
                            primaryAction={{
                                content: 'Delete',
                                onAction: () => handleDeleteReward(true),
                                destructive: true,
                                loading: deleteloading
                            }}
                            secondaryActions={[
                                {
                                    content: 'Cancel',
                                    onAction: handleDeleteReward
                                }
                            ]}
                        >
                            <Modal.Section>
                                <Text>Are you sure you want to delete {formik.values.title} reward? This action cannot be reversed.</Text>
                            </Modal.Section>
                        </Modal>
                    </div>
                    <PageActions
                        primaryAction={{
                            content: 'Save',
                            loading: saveloading,
                            onAction: formik.handleSubmit,
                            disabled: !formik.dirty
                        }}
                        secondaryActions={id ? [
                            {
                                content: 'Delete',
                                destructive: true,
                                onAction: handleDeleteReward
                            },
                        ] : []}
                    />
                </Page>
            </div> : <div className='page-loader'><Spinner accessibilityLabel="Spinner example" size="large" /></div>}</>
    )
}

export default IncrementalAmountDiscount