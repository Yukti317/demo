import React, { useState, useCallback, useEffect } from 'react'
import { Page, DropZone, Text, Layout, Modal, Thumbnail, Card, RadioButton, Toast, FormLayout, TextField, Divider, Spinner, Button, InlineStack, Tag, Autocomplete, Icon, TextContainer, IndexTable, Pagination, EmptySearchResult } from '@shopify/polaris';
import { DeleteMinor, NoteMinor, SearchMinor } from '@shopify/polaris-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Field, useFormik } from 'formik';
import * as Yup from "yup";
import { ApiCall, GetApiCall } from '../../helper/axios';
import moment from 'moment/moment';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

const AddVoucher = () => {
    const { voucher_id } = useParams();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const store_client_id = store_data?.shop_data?.store_client_id;
    const navigate = useNavigate();
    const [tagValue, setTagValue] = useState('');
    const [saveloading, setSaveLoading] = useState(false);
    const [saveActiveToast, setSaveActiveToast] = useState(false);
    const [saveActiveToastMessage, setSaveActiveToastMessage] = useState('');
    const [error, setError] = useState('');
    const [datadiscountState, setdatadiscountState] = useState({
        discountNext_Page: 1,
        discountPeriousPage: 1,
        discountNextCursor: '',
        discountPreviousCursor: '',
        discountData: [],
    });
    const [discountRowsPerPage] = useState(10);
    const [discountFilterDataCheck, setdiscountFilterDataCheck] = useState([]);
    const [discountCurrentPage, setdiscountCurrentPage] = useState(1);
    const [WarnStatus, setWarnStatus] = useState({
        productdeleteWarnactive: false,
        productid: '',
        productindex: '',
        discountdeleteWarnactive: false,
        discountindex: '',
        discountid: ''
    });
    const [loader, setloader] = useState(voucher_id ? true : false);
    const [showdeletemodel, setshowdeletemodel] = useState(false);
    const handleDelete = () => setshowdeletemodel(!showdeletemodel);
    const [Deletespinner, setDeletespinner] = useState(false);
    const [discountloader, setdiscountloader] = useState(false);
    const [Searchvalue, setSearchvalue] = useState('');
    const [initialState, setInitialState] = useState({
        vouchername: '',
        tag: [],
        expiredate: '',
        expiretime: '',
        vouchercode: [],
        description: '',
        status: '1',
        files: '',
        base64Image: '',
        productverticalContent: null,
        value: [],

        discountState: {
            activediscountModal: false,
            discountSearchValue: '',
            discounttablesearchValue: '',
            discountidsmaindata: [],
            backupdiscountidsdata: [],
            discountdeletebuttonLoader: false,
            removediscountId: [],
            backupdiscountids: [],
            discountcheckValues: false,
            perticularpagediscountdata: [],
            discountdeleteWarnactive: false,

            alreadySelectedStatusValue: {},
            discountUsedData: []
        }
    });
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    const validationSchema = Yup.object().shape({
        vouchername: Yup.string().required('Voucher Name is required'),
        expiredate: Yup.date().required("Please select date"),
        expiretime: Yup.string().required("Please select time"),
        description: Yup.string().required("Description is required"),
        vouchercode: Yup.array().min(1, 'Please select atlease 1 voucher'),
        // base64Image: Yup.string().required("File is required"),
        value: Yup.array()
            .min(1, 'Tags must have at least 1 element')
            .max(3, 'Tags can have at most 3 elements')
            .required('Tags is required'),
    })
    const toggleActive = useCallback(() => setSaveActiveToast((saveActiveToast) => !saveActiveToast), []);

    const toastMarkup = saveActiveToast ? (
        <Toast content={saveActiveToastMessage} onDismiss={toggleActive} />
    ) : null;

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: () => { CreateUpdate() }
    });
    const handleDropZoneDrop = (_dropFiles, acceptedFiles, _rejectedFiles) => {
        formik.setFieldTouched('files', true)
        if ((acceptedFiles[0]?.size <= 5000000)) {
            const reader = new FileReader();
            reader.readAsDataURL(acceptedFiles[0]);
            reader.onload = () => {
                formik.setFieldValue('base64Image', reader.result)
            }
            formik.setFieldValue('files', acceptedFiles[0])
            setError('')
        } else {
            if (acceptedFiles[0]?.size >= 5000000) {
                setError(`image size is too large, it must be less than 5 MB`)
            } else if (_rejectedFiles.length) {
                setError(`${_rejectedFiles[0].name} is not supported. File must be.jpg, .jpeg, .png`)
                if (_rejectedFiles[0]?.size >= 5000000) {
                    setError(`${_rejectedFiles[0].name} is not supported. File must be.jpg, .jpeg, .png, image size must be less than 5 MB`)
                }
            } else if (_rejectedFiles[0]?.size >= 5000000) {
                setError(`image size is too large, it must be less than 5 MB, File must be.jpg, .jpeg, .png`)
            }
        }
    };


    const CreateUpdate = async () => {
        if (!error) {
            setSaveLoading(true)
            const datetime = formik.values.expiredate + ' ' + formik.values.expiretime
            const tags = [...formik.values.value]
            const voucherid = []
            const vouchername = []
            datadiscountState.discountData.map((item) => {
                if (formik.values.vouchercode.includes((item?.node?.id.includes('DiscountAutomaticNode') ? item?.node?.id.slice(36) : item?.node?.id.slice(31)))) {
                    voucherid.push(item.node.id)
                    vouchername.push(item.node.discount.title)
                }

            })
            const vouchermethod = voucherid[0]?.includes('DiscountAutomaticNode') ? '1' : '2'
            let obj = {}
            tags.map((item, index) => {
                obj[index + 1] = item
            })
            const data = {
                store_client_id: store_client_id,
                title: formik.values.vouchername,
                tag: obj,
                expiry_date: datetime,
                voucher_code: formik.values.vouchercode[0],
                description: formik.values.description,
                files: formik.values.base64Image,
                reward_status: formik.values.status[0],
                voucher_method: vouchermethod,
                voucher_name: vouchername[0],
                ...voucher_id && { id: Number(voucher_id) }
            }

            if (voucher_id) {
                if (formik.values.files === formik.initialValues.files) {
                    delete data.files;
                }
                await ApiCall('PUT', '/update_voucher', data, { authentication: token }).then((res) => {
                    if (res.status === 200) {
                        setSaveActiveToastMessage(res.data.message);
                        toggleActive();
                        setTimeout(() => {
                            navigate('/voucher');
                        }, 1000)
                    } else {
                        setSaveActiveToastMessage(res?.data?.message ? res?.data?.message : 'Something went wrong!');
                        toggleActive();
                        setSaveLoading(false);
                    }
                })
            } else {
                await ApiCall('POST', '/add_voucher', data, { authentication: token }).then((res) => {

                    if (res.status === 200) {
                        setSaveActiveToastMessage(res.data.message);
                        toggleActive();
                        setTimeout(() => {
                            navigate('/voucher');
                        }, 1000)
                    } else {
                        setSaveActiveToastMessage(res?.data?.message ? res?.data?.message : 'Something went wrong!');
                        toggleActive();
                        setSaveLoading(false);
                    }
                })


            }
        } else {
            formik.setFieldTouched('files', true);
            setError(`Image is required!`);
        }
    }

    const Getvoucherdata = async () => {
        if (voucher_id) {
            const data = { ...initialState }
            await GetApiCall('GET', `/voucher_get/${voucher_id}`, { authentication: token }).then((res) => {
                if (res.status === 200 && res.data.status === 'SUCCESS') {
                    const editdata = res.data.data.voucher
                    const voucherData = res.data.data.VoucherData?.data?.automaticDiscountNode
                    const voucherdiscountnode = res.data.data.VoucherData.data?.codeDiscountNode
                    const voucherid = voucherData?.id?.includes('DiscountAutomaticNode') ? (voucherData.id).slice(36) : voucherData?.id?.slice(31)
                    const voucherdiscountid = voucherData?.id?.includes('DiscountCodeNode') ? (voucherData.id).slice(31) : voucherData?.id?.slice(36)
                    data.vouchername = editdata.title
                    data.expiredate = moment(editdata.expiry_date).format('YYYY-MM-DD')
                    data.expiretime = moment(editdata.expiry_date).format('HH:mm')
                    const arr = [];
                    if (editdata.tag) {
                        Object.values(JSON.parse(editdata.tag)).map((item) => {
                            arr.push(item);
                        })
                        data.productverticalContent = arr?.length > 0 ? (
                            <InlineStack gap="200">
                                {arr?.map((tag, indexes) => (
                                    <Tag key={indexes} onRemove={() => productTagremove(indexes, arr)}>{tag}</Tag>
                                ))}
                            </InlineStack>
                        ) : null
                        data.value = arr;
                    }
                    data.vouchercode = [editdata.voucher_code]
                    const DiscountAutomaticNode = {
                        title: voucherData?.automaticDiscount?.title,
                        discountid: voucherid
                    }
                    const DiscountCodeNode = {
                        title: voucherdiscountnode?.codeDiscount?.title,
                        discountid: voucherdiscountid
                    }
                    if (voucherData) {
                        if (voucherData !== null) {
                            data.discountState.discountidsmaindata = [DiscountAutomaticNode]
                            data.discountState.backupdiscountidsdata = [DiscountAutomaticNode]
                        }
                    } else if (voucherdiscountnode) {
                        if (voucherdiscountnode !== null) {
                            data.discountState.discountidsmaindata = [DiscountCodeNode]
                            data.discountState.backupdiscountidsdata = [DiscountCodeNode]
                        }
                    }
                    data.description = editdata.description
                    data.files = editdata.files
                    data.base64Image = editdata.files
                    data.status = editdata.reward_status
                    setInitialState(data)

                }
            })

        }
        setloader(false)
    }
    const Getvoucherdiscount = async (value, pagequery, cursor) => {
        let url = '/get_all_discouts?page_query=after';
        const pagecursor = !cursor ? '' : cursor;
        const pagequerydata = !pagequery ? 'after' : pagequery;
        if (value && value.length >= 3) {
            url = `/get_all_discouts?page_query=${pagequerydata}&search_key=${value}`;
        }
        const urldata = !value ? !pagecursor ? `/get_all_discouts?page_query=${pagequerydata}` : `/get_all_discouts?page_query=${pagequerydata}&cursor=${pagecursor}` : url;
        const res = await GetApiCall('GET', urldata, { authentication: token });
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const data = res.data.data;
            const datadiscount = { ...datadiscountState };
            datadiscount.discountNext_Page = data.pageInfo.hasNextPage;
            datadiscount.discountPeriousPage = data.pageInfo.hasPreviousPage;
            datadiscount.discountNextCursor = data.discounts[data.discounts.length - 1]?.cursor;
            datadiscount.discountPreviousCursor = data.discounts[0]?.cursor;
            datadiscount.discountData = data?.discounts;

            setdatadiscountState(datadiscount);
            setdiscountloader(false);
        } else {
            const data = { ...datadiscountState };
            data.discountData = [];
            setdatadiscountState(data);
            setdiscountloader(false);
        }
    }

    const handlediscountmodal = (activepopup) => {
        formik.setFieldValue('discountState.activediscountModal', activepopup);
        formik.setFieldValue('discountState.alreadySelectedStatusValue', formik.values.vouchercode);
    }
    const deletediscounts = (discountid, discountindex) => {
        discountid = `${discountid}`
        const newdiscountids = [...formik.values.vouchercode];
        const index = newdiscountids.indexOf(discountid.includes('DiscountAutomaticNode') ? (discountid).slice(36) : discountid.slice(31));
        newdiscountids.splice(index, 1);
        formik.setFieldValue('vouchercode', newdiscountids);
        const newdata = [...formik.values.discountState.discountidsmaindata];
        const deleteddata = newdata.splice(discountindex, 1);
        formik.setFieldValue('discountState.discountidsmaindata', newdata);
        formik.setFieldValue('discountState.discountdeletebuttonLoader', false);
        const backupdiscountidsnewdata = [];
        formik.values.discountState.backupdiscountidsdata.map((data) => {
            if (data.discountid !== deleteddata[0].discountid) {
                backupdiscountidsnewdata.push(data);
            }
            return backupdiscountidsnewdata;
        }
        );
        formik.setFieldValue('discountState.backupdiscountidsdata', backupdiscountidsnewdata);

    };
    const discountDelete = () => {
        handlediscountdeletewarn();
        formik.setFieldValue('discountState.discountdeletebuttonLoader', true);
        deletediscounts(WarnStatus.discountid, WarnStatus.discountindex);
    };
    const handlesearchfromdiscountdata = (value) => {
        formik.setFieldValue('discountState.discounttablesearchValue', value);
        if (value && formik.values.discountState.backupdiscountidsdata.length === 0) {
            handlediscountmodal(true);
            formik.setFieldValue('discountState.discountSearchValue', value);
        } else {
            if (value && value.length >= 3) {
                const array = formik.values.discountState.discounttablesearchValue !== value ? formik.values.discountState.backupdiscountidsdata : formik.values.discountState.discountidsmaindata;
                const filterdata = array.filter((data) => {
                    let valuestobereturn;
                    if ((data?.firstName && (data?.firstName.includes(value))) || (data?.lastName && (data?.lastName.includes(value))) || (data?.email && (data?.email.includes(value)))) {
                        valuestobereturn = data;
                    }
                    return valuestobereturn;
                });
                formik.setFieldValue('discountState.discountidsmaindata', filterdata);
            } else {
                formik.setFieldValue('discountState.discountidsmaindata', formik.values.discountState.backupdiscountidsdata);
            }
        }
    };
    const handlediscountdeletewarn = (discountid, index) => {
        const data = { ...WarnStatus };
        data.discountid = discountid;
        data.discountindex = index;
        data.discountdeleteWarnactive = !data.discountdeleteWarnactive;
        setWarnStatus(data);
    };

    const selecteddiscountRowMarkup = formik.values.discountState.discountidsmaindata && formik.values.discountState.discountidsmaindata.length ? formik.values.discountState.discountidsmaindata.map(
        (data, index) => (
            <IndexTable.Row id={index} key={index} position={index}>
                <IndexTable.Cell>
                    <div className='productlistingtable'>
                        <div className='discountthumbnail'>
                            <p>{data?.title}</p>
                        </div>
                        <div className='productActionBtn'>
                            <span
                                onClick={() => {
                                    handlediscountdeletewarn(data?.discountid, index);
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
    const discountTotalPages = Math.ceil(selecteddiscountRowMarkup.length / discountRowsPerPage);
    const getItemsFordiscount = (page) => {
        let pageNumber = page;
        if (formik.values.discountState.discounttablesearchValue && formik.values.discountState.discounttablesearchValue.length >= 3) {
            if (discountCurrentPage > 1 && discountFilterDataCheck === 1) {
                pageNumber = 1;
                setdiscountCurrentPage(1);
                setdiscountFilterDataCheck(0);
            }
        }
        const startIndex = (pageNumber - 1) * discountRowsPerPage;
        const endIndex = startIndex + discountRowsPerPage;
        const currentArray = selecteddiscountRowMarkup;
        return currentArray.slice(startIndex, endIndex);
    };
    let discountToDisplay = getItemsFordiscount(discountCurrentPage);
    if ((discountToDisplay.length === 0) && discountCurrentPage > 1) {
        discountToDisplay = getItemsFordiscount(1);
        setdiscountCurrentPage(1);
    }

    const adddiscount = () => {
        formik.setFieldValue('discountState.discounttablesearchValue', '');
        const mainarray = [];
        let discountDataObjects = {};
        const discountid = datadiscountState.discountData.filter((item) => {
            return (
                formik.values.vouchercode.includes((item?.node?.id.includes('DiscountAutomaticNode') ? item?.node?.id.slice(36) : item?.node?.id.slice(31))) &&
                item
            );
        });
        const perpagedata = [];
        const perpagedatacursorSet = new Set();
        for (const data of [...discountid]) {
            if (!perpagedatacursorSet.has(data.node.id)) {
                perpagedata.push(data);
                perpagedatacursorSet.add(data.node.id);
            }
        }

        if (perpagedata && perpagedata.length) {
            perpagedata.map(
                (data) => {
                    discountDataObjects = {
                        title: data?.node?.discount.title,
                        discountid: data?.node?.id
                    };
                    mainarray.push(discountDataObjects);
                    return discountDataObjects;
                });
        }
        formik.setFieldValue('discountState.discountidsmaindata', mainarray);
        formik.setFieldValue('discountState.backupdiscountidsdata', mainarray);
        formik.setFieldValue('discountState.activediscountModal', false);
        if (formik.values.discountState.removediscountId.length) {
            const updatedRemoveProductId = formik.values.discountState.removediscountId.filter(id => !formik.values.vouchercode.includes(id));
            const difference = mainarray.filter(x => !updatedRemoveProductId.includes(x.discountid));
            formik.setFieldValue('discountState.discountidsmaindata', difference);
            formik.setFieldValue('discountState.backupdiscountidsdata', difference);

            formik.setFieldValue('discountState.removediscountId', []);
        }
        formik.setFieldValue('discountState.perticularpagediscountdata', []);
        formik.setFieldValue('discountState.discountSearchValue', '');
        if (formik.values.discountState.discountSearchValue) {
            Getvoucherdiscount();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Getvoucherdiscount();
            Getvoucherdata();
        }
        if (token) {
            fetchData();
        }
    }, [token])

    const Deleteorder = async () => {
        setDeletespinner(true)
        await ApiCall('DELETE', '/delete_voucher', { id: Number(voucher_id) }, { authentication: token }).then((res) => {
            if (res.status === 200) {
                navigate('/voucher')
            }
        })
        setDeletespinner(false)
    }

    const deletemodal = () => {
        setshowdeletemodel(true)
    }

    const productTagOnKeyPressFn = (event, currentData) => {
        formik.setFieldTouched('value', true);
        if (tagValue !== '' && (event.keyCode === 13 || event.keyCode === 9)) {
            const custmertagdata = [...currentData];
            custmertagdata.push(tagValue);
            formik.setFieldValue('value', custmertagdata);
            formik.setFieldValue('productverticalContent', custmertagdata?.length > 0 ? (
                <InlineStack gap="200">
                    {custmertagdata?.map((tag, indexes) => (
                        <Tag key={indexes} onRemove={() => productTagremove(indexes, custmertagdata)}>{tag}</Tag>
                    ))}
                </InlineStack>
            ) : null);
            formik.setFieldValue('tag', '');
        }
        setTagValue('');
    };

    const productTagremove = (indexs, data) => {
        const tagData = [...data];
        tagData?.splice(indexs, 1);
        formik.setFieldValue(`productverticalContent`, tagData?.length > 0 ? (
            <InlineStack gap="200">
                {tagData?.map((tag, indexes) => (
                    <Tag key={indexes} onRemove={() => productTagremove(indexes, tagData)}>{tag}</Tag>
                ))}
            </InlineStack>
        ) : null);

        formik.setFieldValue('value', tagData?.length > 0 ? tagData : []);
    };

    let voucherBreadcrumb = {};
    if (process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my')) {
        voucherBreadcrumb = AppButton.create(BridgeApp, { label: 'Voucher' });
        voucherBreadcrumb.subscribe(AppButton.Action.CLICK, () => {
            BridgeApp.dispatch(Redirect.toApp({ path: '/redeem-points' }));
        });
    }

    const handleTextFieldChange = useCallback((value) => {
        setTagValue(value);
        formik.setFieldValue('tag', value);
    }, []);

    const discountcancelbtn = () => {
        formik.setFieldValue('vouchercode', formik.values.discountState.alreadySelectedStatusValue);
        formik.setFieldValue('discountState.activediscountModal', false);
        if (formik.values.discountState.discountSearchValue && formik.values.discountState.discountSearchValue.length) {
            Getvoucherdiscount();
        }
        formik.setFieldValue('discountState.discountSearchValue', '');
        formik.setFieldValue('discountState.removediscountId', []);
        if (formik.values.discountState.discounttablesearchValue.length === 1) {
            formik.setFieldValue('discountState.discounttablesearchValue', '');
        }
    };
    const handlediscountdata = () => {
        const olddata = [...formik.values.discountState.perticularpagediscountdata];
        const discountids = datadiscountState.discountData.filter((item) => {
            return (
                formik.values.vouchercode.includes((item?.node?.id.includes('DiscountAutomaticNode') ? item?.node?.id.slice(36) : item?.node?.id.slice(31))) &&
                item
            );
        });
        const newdata = [];
        const dataSet = new Set();
        for (const data of [...olddata, ...discountids]) {
            if (!dataSet.has(data.cursor)) {
                newdata.push(data);
                dataSet.add(data.cursor);
            }
        }
        formik.setFieldValue('discountState.perticularpagediscountdata', newdata);

    };
    const handlealldiscountsearch = (value) => {
        formik.setFieldValue('discountState.discountSearchValue', value);
        if (value && value.length >= 3) { Getvoucherdiscount(value); }
        if (value === '') { Getvoucherdiscount(value); }
    };

    const handleChangediscountCheckbox = (id) => {
        // formik.setFieldTouched('discountState.discountidsmaindata', true);
        const deletedId = [...formik.values.discountState.removediscountId];
        const array = [];
        if (array.includes(id)) {
            deletedId.push(id);
            const index = array.indexOf(id);
            array.splice(index, 1);
        } else {
            array.push(id);
        }
        formik.setFieldValue('vouchercode', array);
        formik.setFieldValue('discountState.removediscountId', deletedId);
    };
    const alldiscountmarkup = datadiscountState.discountData && datadiscountState.discountData.length > 0 ? datadiscountState.discountData?.map(
        (ite, i) => [
            <IndexTable.Row key={i}>

                <div className={!formik.values.discountState.discountUsedData.includes(ite?.node?.id) ? 'IndexTableCell' : 'IndexTableProduct'} onClick={() => {
                    if (!formik.values.discountState.discountUsedData.includes(ite?.node?.id)) {
                        handleChangediscountCheckbox((ite?.node?.id.includes('DiscountAutomaticNode') ? ite?.node?.id.slice(36) : ite?.node?.id.slice(31)))
                    }
                }}>

                    <IndexTable.Cell>
                        <div className='productdata'>
                            <RadioButton
                                checked={formik.values?.vouchercode?.includes((ite?.node?.id.includes('DiscountAutomaticNode') ? ite?.node?.id.slice(36) : ite?.node?.id.slice(31)))}
                                name="discounts"
                                id={(ite?.node?.id.includes('DiscountAutomaticNode') ? ite?.node?.id.slice(36) : ite?.node?.id.slice(31))}
                                disabled={!(formik.values.discountState.discountUsedData.includes(ite?.node?.id.includes('DiscountAutomaticNode') ? ite?.node?.id.slice(36) : ite?.node?.id.slice(31))) ? false : true}
                            />
                            <div>
                                <p>{ite?.node?.discount.title}</p>
                            </div>
                        </div>
                    </IndexTable.Cell>
                </div>
            </IndexTable.Row>
        ]
    ) : [];
    const emptyState = (
        <EmptySearchResult
            title={'Voucher not found'}
            description={'Try changing the search term'}
            withIllustration
        />
    );

    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                <TitleBar title='Add Voucher' breadcrumbs={voucherBreadcrumb} />
            </Provider> : <></>}
            {!loader ? <div className='add-voucher-page'>
                <Page
                    title={!voucher_id ? 'Add Voucher' : 'Edit Voucher'}
                    backAction={{ content: 'Products', onAction: () => navigate('/voucher') }}
                    primaryAction={{ primary: true, content: !voucher_id ? 'Add' : 'Save', loading: saveloading, disabled: !formik.dirty, onAction: () => { if (!(formik.values.files || formik.values.base64Image)) setError(`Image is required!`); formik.handleSubmit(); } }}
                >
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <div className='voucher-dropzone'>
                                    <DropZone onDrop={handleDropZoneDrop} accept="image/png, image/jpg, image/jpeg" error={error} allowMultiple={false}>
                                        {formik.values.files ?
                                            (typeof formik.values.files == 'object') ?
                                                <Thumbnail
                                                    size="large"
                                                    alt={formik.values.files?.name}
                                                    source={validImageTypes.includes(formik.values.files?.type) ? window.URL.createObjectURL(formik.values.files) : NoteMinor}
                                                /> :
                                                <Thumbnail
                                                    size="large"
                                                    alt={formik.values.files}
                                                    source={formik.values.files}
                                                    disabled={false}
                                                />
                                            : <DropZone.FileUpload actionHint="Accepts .jpg, and .png" />
                                        }
                                    </DropZone>

                                    {formik.touched?.files && error && <div class="Polaris-Labelled__Error">
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
                                            {error}
                                        </div>
                                    </div>}
                                </div>
                                <div className='pt-3'>
                                    <FormLayout>

                                        <FormLayout.Group>
                                            <TextField
                                                type="text"
                                                label="Voucher Name"
                                                onChange={(value) => formik.setFieldValue('vouchername', value)}
                                                value={formik.values.vouchername}
                                                autoComplete="off"
                                                onBlur={() => formik.setFieldTouched('vouchername')}
                                                error={formik.touched.vouchername && formik.errors.vouchername}
                                            />
                                            <div onKeyDown={(e) => productTagOnKeyPressFn(e, formik.values.value)} >
                                                <TextField
                                                    label="Tags"
                                                    value={formik.values.tag}
                                                    onChange={(value) => handleTextFieldChange(value)}
                                                    autoComplete="off"
                                                    verticalContent={formik.values?.productverticalContent}
                                                    onBlur={() => formik.setFieldTouched('tag')}
                                                    error={formik.values.value.length === 0 ? formik.touched.tag &&  formik.errors.value :formik.values.value.length > 3 ? formik.touched.tag &&  formik.errors.value : ''  }
                                                />
                                            </div>

                                        </FormLayout.Group>
                                        <FormLayout.Group>
                                            <TextField
                                                type="date"
                                                label="Expiry Date"
                                                onChange={(value) => formik.setFieldValue('expiredate', value)}
                                                value={formik.values.expiredate}
                                                autoComplete="off"
                                                onBlur={() => formik.setFieldTouched('expiredate')}
                                                error={formik.touched.expiredate && formik.errors.expiredate}
                                            />
                                            <TextField
                                                type="time"
                                                label="Expiry Time"
                                                onChange={(value) => formik.setFieldValue('expiretime', value)}
                                                value={formik.values.expiretime}
                                                autoComplete="off"
                                                onBlur={() => formik.setFieldTouched('expiretime')}
                                                error={formik.touched.expiretime && formik.errors.expiretime}
                                            />
                                        </FormLayout.Group>
                                        <div className='mt-3'>

                                            <TextField
                                                value={Searchvalue}
                                                placeholder='Search'
                                                label="Voucher code"
                                                autoComplete='off'
                                                onChange={(value) => { handlesearchfromdiscountdata(value) }}
                                                connectedRight={
                                                    <Button size='large' onClick={() => handlediscountmodal(true)}>Browse</Button>
                                                }
                                            />

                                            <div className='indextable'>
                                                {
                                                    (formik.values.discountState.discountidsmaindata && formik.values.discountState.discountidsmaindata.length) || formik.values.discountState.discounttablesearchValue ? <>
                                                        <IndexTable
                                                            itemCount={formik.values.discountState.discountidsmaindata.length}
                                                            selectable={false}
                                                            emptyState={formik.values.discountState.backupdiscountidsdata.length !== 0 ? emptyState : []}
                                                            headings={[{ title: 'Title' }]}
                                                        >
                                                            {discountToDisplay}
                                                        </IndexTable>
                                                        {discountTotalPages > 1 ? <div className='productData-pagination'>
                                                            <Pagination
                                                                previousTooltip="Previous"
                                                                nextTooltip='Next'
                                                                hasPrevious={discountCurrentPage > 1}
                                                                onPrevious={() => { setdiscountCurrentPage(parseInt(discountCurrentPage) - 1); }}
                                                                hasNext={discountCurrentPage < discountTotalPages}
                                                                onNext={() => { setdiscountCurrentPage(parseInt(discountCurrentPage) + 1); }}
                                                            />
                                                        </div> : ''}
                                                    </> : ''
                                                }
                                            </div>
                                            {formik.errors?.vouchercode && formik.touched?.vouchercode && <div class="Polaris-Labelled__Error">
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
                                                    {formik.errors.vouchercode}
                                                </div>
                                            </div>}
                                        </div>
                                        <TextField
                                            label="Description"
                                            value={formik.values.description}
                                            onChange={(value) => formik.setFieldValue('description', value)}
                                            multiline={3}
                                            autoComplete="off"
                                            onBlur={() => formik.setFieldTouched('description')}
                                            error={formik.touched.description && formik.errors.description}
                                        />
                                    </FormLayout>
                                </div>

                            </Card>
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
                                        /><br />

                                        {formik.values.status === '3' ?
                                            <RadioButton
                                                label="Expired"
                                                checked={formik.values.status === '3'}
                                                id="status_2"
                                                name="status"
                                                onChange={() => { formik.setFieldValue('status', '3') }}
                                            /> : ''}
                                    </div>
                                </Card>
                            </div>
                        </Layout.Section>
                    </Layout>
                    <div className="divider mt-3">
                        <Divider borderColor="border-inverse" />
                    </div>
                    <div class={voucher_id ? "Polaris-ButtonGroup justify-content-between mt-4" : "Polaris-ButtonGroup justify-content-end mt-4"}>
                        {voucher_id ? <Button variant="primary" tone="critical" onClick={() => deletemodal()}>Delete</Button> : ''}
                        <Button variant="primary" loading={saveloading} onClick={() => formik.handleSubmit()} disabled={!formik.dirty}>{voucher_id ? 'Save' : "Add"}</Button>
                    </div>
                </Page>
                <div className="discountmodal">
                    <Modal
                        open={formik.values.discountState.activediscountModal}
                        onClose={() => {
                            formik.setFieldValue('discountState.activediscountModal', false);
                            // handleproductmodalclose();
                        }}
                        title="Specific discount"
                        onTransitionEnd={() => {
                            formik.setFieldValue('discountState.backupdiscountids', JSON.stringify(formik.values.vouchercode));
                            formik.setFieldValue('discountState.discountcheckValues', false);
                        }}
                        primaryAction={{
                            content: 'Done',
                            onAction: () => adddiscount(),
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: () => discountcancelbtn(),
                            },
                        ]}
                        footer={
                            (!datadiscountState.discountData && (formik.values.discountState.discountSearchValue === '' || formik.values.discountState.discountSearchValue?.length >= 0)) ? (<></>) : (
                                <div>
                                    <div className='footercontect'>
                                        <div className='paginationContent'>
                                            {datadiscountState.discountData.length > 99 && (datadiscountState.discountPeriousPage === true || datadiscountState.discountNext_Page === true) ? (
                                                <>
                                                    <Pagination
                                                        previousTooltip="Previous"
                                                        nextTooltip='Next'
                                                        hasPrevious={datadiscountState.discountPeriousPage > 0}
                                                        onPrevious={() => {
                                                            Getvoucherdiscount(formik.values.discountState.discountSearchValue, 'before', datadiscountState.discountPreviousCursor);
                                                            handlediscountdata();
                                                            setdiscountloader(true);
                                                        }}
                                                        hasNext={datadiscountState.discountNext_Page >= 1}
                                                        onNext={() => {
                                                            Getvoucherdiscount(formik.values.discountState.discountSearchValue, 'after', datadiscountState.discountNextCursor);
                                                            handlediscountdata();
                                                            setdiscountloader(true);
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
                                        value={formik.values.discountState.discountSearchValue}
                                        placeholder='Search'
                                        autoComplete='off'
                                        onChange={(value) => { handlealldiscountsearch(value); handlediscountdata(); }}
                                        onClearButtonClick={() => {
                                            formik.setFieldValue('discountState.discountSearchValue', '');
                                            Getvoucherdiscount();
                                        }}
                                    />
                                </div>
                                <div className="producttable">
                                    {!discountloader ? <IndexTable
                                        itemCount={datadiscountState.discountData.length}
                                        headings={[[]]}
                                        selectable={false}
                                        emptyState={emptyState}
                                    >
                                        {alldiscountmarkup}
                                    </IndexTable> : <div className="page_loader" key="loader">
                                        <Spinner size="large" />
                                    </div>}
                                </div>
                            </div>


                        </Modal.Section>
                    </Modal>
                    <div className="discountdeletemodal">
                        <Modal
                            open={WarnStatus.discountdeleteWarnactive}
                            onClose={handlediscountdeletewarn}
                            title='Delete discount'
                            primaryAction={{
                                content: 'Delete',
                                onAction: discountDelete,
                                destructive: true,
                                loading: formik.values.discountState.discountdeletebuttonLoader
                            }}
                            secondaryActions={[
                                {
                                    content: 'Cancel',
                                    onAction: handlediscountdeletewarn
                                }
                            ]}
                        >
                            <Modal.Section>
                                <Text>Are you sure, you want to delete this discount </Text>
                            </Modal.Section>
                        </Modal>
                    </div>
                </div>
                <div className="earnpointdeletemodal">
                    <Modal
                        open={showdeletemodel}
                        onClose={handleDelete}
                        title='Delete discount'
                        primaryAction={{
                            content: 'Delete',
                            onAction: Deleteorder,
                            destructive: true,
                            loading: Deletespinner
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: handleDelete
                            }
                        ]}
                    >
                        <Modal.Section>
                            <Text>Are you sure, you want to delete </Text>
                        </Modal.Section>
                    </Modal>
                </div>
                {toastMarkup}
            </div> : <div className='page-loader'><Spinner accessibilityLabel="Spinner example" size="large" /></div>}
        </>
    )
}

export default AddVoucher