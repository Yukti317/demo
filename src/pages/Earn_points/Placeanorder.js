import { Button, Card, ChoiceList, Divider, Icon, Layout, Page, Modal, Text, TextField, Thumbnail, IndexTable, EmptySearchResult, Badge, Checkbox, RadioButton, Pagination, Spinner, Toast} from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { DeleteMinor, ImageMajor, SearchMinor } from '@shopify/polaris-icons';
import { useFormik } from 'formik';
import { ApiCall, GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

function Placeanorder() {
    const { order_id } = useParams();
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const store_client_id = store_data?.shop_data?.store_client_id;
    const [backupInitialstate, setbackupInitialstate] = useState();
    const [usedcollection, setUsedcollection] = useState([])
    const [saveActiveToast, setSaveActiveToast] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isGlobalAvailable, setIsGlobalAvailable] = useState(false);
    const [initialPriority, setInitialPriority] = useState(0);
    const [saveActiveToastMessage, setSaveActiveToastMessage] = useState('');
    const [initialvalue, setInitialvalue] = useState({
        earningtitle: '',
        status: '1',
        statusapply: ['1'],
        statusapplayvalue: {},
        statusapplycollectionvalue: [],
        icon: '1',
        earningvalue: '',
        priority: '',
        productState: {
            activeProductModal: false,
            activeProductVarientModal: false,
            productSearchValue: '',
            producttablesearchValue: '',
            productidsmaindata: [],
            productvarients: '',
            backupproductidsdata: [],
            productdeletebuttonLoader: false,
            removeProductId: [],
            backupProductids: [],
            varientBackupProductID: {},
            productcheckValues: false,
            perticularpageProductdata: [],
            productdeleteWarnactive: false,
            productUsedData: {}
        },
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
            alreadySelectedStatusValue: {}
        }
    })
    const [loader, setloader] = useState(true);
    const [Deletespinner, setDeletespinner] = useState(false);
    const [productloader, setProductloader] = useState(false);
    const [productCurrentPage, setproductCurrentPage] = useState(1);
    const [productRowsPerPage] = useState(10);
    const [PerticularproductId, setPerticularproductId] = useState();
    const [productFilterDataCheck, setproductFilterDataCheck] = useState([]);
    const [productVarientCurrentPage, setproductVarientCurrentPage] = useState(1);
    const [dataproductState, setdataproductState] = useState({
        productNext_Page: 1,
        productPeriousPage: 1,
        productNextCursor: '',
        productPreviousCursor: '',
        productData: []
    });
    const [datacollectionState, setdatacollectionState] = useState({
        collectionNext_Page: 1,
        collectionPeriousPage: 1,
        collectionNextCursor: '',
        collectionPreviousCursor: '',
        collectionData: []
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
    const [showdeletemodel, setshowdeletemodel] = useState(false);
    const handleDelete = () => setshowdeletemodel(!showdeletemodel);
    const formik = useFormik({
        initialValues: initialvalue,
        enableReinitialize: true,
        validationSchema: Yup.object({
            earningtitle: Yup.string().required('Title is required'),
            priority: Yup.number().required('Priority is required').min(1, "Priority is must be greater than 0"),
            statusapplayvalue: Yup.object().test('isNotEmpty', 'Please select at least 1 Product', function (value) {
                const applyToType = this.parent.statusapply;
                if (applyToType && applyToType[0] === '2') {
                    return Object.keys(value).length !== 0;
                }
                return true;
            }),

            statusapplycollectionvalue: Yup.array().when('statusapply', (statusapply, field) => ((statusapply[0][0] === '3') ? field.min(1, 'Please select at least 1 Collection') : field)),
            earningvalue: Yup.number().required('Earning value is required').min(1, 'Earning value is must be greater than 0'),

        }),
        onSubmit: () => { CreateUpdate() }
    })
    const toggleActive = useCallback(() => setSaveActiveToast((saveActiveToast) => !saveActiveToast), []);

    const toastMarkup = saveActiveToast ? (
        <Toast content={saveActiveToastMessage} onDismiss={toggleActive} />
    ) : null;

    const renderChildren = useCallback((isSelected) =>
        isSelected && (
            <>
                <div className="searchfield">
                    <TextField prefix={<Icon
                        source={SearchMinor}
                    />}
                        value={formik.values.statusapply[0] === '2' ? formik.values.productState.producttablesearchValue : formik.values.collectionState.collectiontablesearchValue}
                        placeholder='Search'
                        autoComplete='off'
                        onChange={(value) => { formik.values.statusapply[0] === '2' ? handlesearchfromproductdata(value) : handlesearchfromcollectiondata(value) }}
                        connectedRight={
                            <Button size='large' onClick={() => { formik.values.statusapply[0] === '2' ? handleproductmodal(true) : handlecollectionmodal(true) }}>Browse</Button>
                        }
                        error={formik.values.statusapply[0] === '2' ? formik.touched.statusapplayvalue && formik.errors.statusapplayvalue : formik.touched.statusapplycollectionvalue && formik.errors.statusapplycollectionvalue}
                    />

                </div>
                {formik.values.statusapply[0] === '2' ?
                    <div className='indextable'>
                        {
                            (formik.values.productState.productidsmaindata && formik.values.productState.productidsmaindata.length) || formik.values.productState.producttablesearchValue ?
                                <> <IndexTable
                                    itemCount={formik.values.productState.productidsmaindata.length}
                                    selectable={false}
                                    emptyState={formik.values.productState.backupproductidsdata.length !== 0 ? selectedProductemptyStateMarkup : []}
                                    headings={[{}]}
                                >
                                    {productToDisplay}
                                </IndexTable>
                                    {productTotalPages > 1 ? <div className='footercontect'>
                                        <Pagination
                                            previousTooltip="Previous"
                                            nextTooltip='Next'
                                            hasPrevious={productCurrentPage > 1}
                                            onPrevious={() => { setproductCurrentPage(parseInt(productCurrentPage) - 1); }}
                                            hasNext={productCurrentPage < productTotalPages}
                                            onNext={() => { setproductCurrentPage(parseInt(productCurrentPage) + 1); }}
                                        />
                                    </div> : ''}
                                </> : ''
                        }
                    </div> : formik.values.statusapply[0] === '3' ?
                        <div className='indextable'>
                            {(formik.values.collectionState.collectionidsmaindata && formik.values.collectionState.collectionidsmaindata.length) || formik.values.collectionState.collectiontablesearchValue ?
                                <>
                                    <IndexTable
                                        itemCount={formik.values.collectionState.collectionidsmaindata.length}
                                        selectable={false}
                                        emptyState={formik.values.collectionState.backupcollectionidsdata.length !== 0 ? selectedcollectionemptyStateMarkup : []}
                                        headings={[{ title: 'Title' }]}
                                    >
                                        {collectionToDisplay}
                                    </IndexTable>
                                    {collectionTotalPages > 1 ?
                                        <div className='footercontect'>
                                            <Pagination
                                                previousTooltip="Previous"
                                                nextTooltip='Next'
                                                hasPrevious={collectionCurrentPage > 1}
                                                onPrevious={() => { setcollectionCurrentPage(parseInt(collectionCurrentPage) - 1); }}
                                                hasNext={collectionCurrentPage < collectionTotalPages}
                                                onNext={() => { setcollectionCurrentPage(parseInt(collectionCurrentPage) + 1); }}
                                            />
                                        </div> : ''}
                                </> : ''}
                        </div> : ''}
            </>
        ), [formik.values.statusapply, formik.values.productState.producttablesearchValue, formik.values.productState.productidsmaindata, formik.values.productState.backupproductidsdata.length, formik.values.collectionState.collectiontablesearchValue, formik.values.collectionState.collectionidsmaindata, formik.values.collectionState.backupcollectionidsdata.length, formik.touched.statusapplayvalue, formik.touched.statusapplycollectionvalue, formik.errors.statusapplayvalue, formik.errors.statusapplycollectionvalue]);

    const handlesearchfromproductdata = (value) => {
        formik.setFieldValue('productState.producttablesearchValue', value);
        if (value && formik.values.productState.backupproductidsdata.length === 0) {
            handleproductmodal(true);
            formik.setFieldValue('productState.productSearchValue', value);
        } else {
            if (value && value.length >= 3) {
                const array = formik.values.productState.producttablesearchValue !== value ? formik.values.productState.backupproductidsdata : formik.values.productState.productidsmaindata;
                const filterdata = array.filter((data) => {
                    let valuestobereturn;
                    if (data?.title.toLowerCase().includes(value.toLowerCase())) {
                        valuestobereturn = data;
                    }
                    return valuestobereturn;
                });
                formik.setFieldValue('productState.productidsmaindata', filterdata);
            } else {
                formik.setFieldValue('productState.productidsmaindata', formik.values.productState.backupproductidsdata);
            }
        }

    };
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
                    if ((data?.title.toLowerCase().includes(value.toLowerCase()))) {
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

    const CreateUpdate = async () => {
        setSaveLoading(true);
        const ProductData = {};
        const product = formik.values.statusapplayvalue;
        Object.keys(product).map((item) => {
            ProductData[item] =
                product[item].map((varients) => {
                    return varients;
                });
            return ProductData;
        });
        const data = {
            store_client_id: store_client_id,
            title: formik.values.earningtitle,
            priority: parseInt(formik.values.priority),
            earning_value: Number(formik.values.earningvalue),
            reward_status: formik.values.status[0],
            status_apply: formik.values.statusapply[0],
        }
        if (formik.values.statusapply[0] === '2') {
            data.product_id = formik.values.statusapplayvalue
        } else if (formik.values.statusapply[0] === '3') {
            data.collection_id = `${formik.values.statusapplycollectionvalue[0]}`
        }
        if (order_id) {
            data.id = order_id;
            if (initialPriority === parseInt(formik.values.priority)) {
                delete data.priority;
            }
            if ((formik.values.statusapply[0] === formik.initialValues.statusapply[0])) {
                delete data.status_apply;
            }
            const res = await ApiCall('PUT', `/update_place_an_order`, data, { authentication: token });
            if (res.data.status === 'SUCCESS' && res.status === 200) {
                setSaveActiveToastMessage(res.data.message)
                toggleActive();
                setTimeout(() => {
                    navigate('/earnpoints')
                }, 1000);
            } else {
                setSaveActiveToastMessage(res?.data?.message ? res?.data?.message : 'Something went wrong!');
                toggleActive();
                setSaveLoading(false);
            }
        } else {
            const res = await ApiCall('POST', '/place_an_order', data, { authentication: token });
            if (res.data.status === 'SUCCESS' && res.status === 200) {
                setSaveActiveToastMessage(res.data.message)
                toggleActive();
                setTimeout(() => {
                    navigate('/earnpoints')
                }, 1000)
            } else {
                setSaveActiveToastMessage(res?.data?.message ? res?.data?.message : 'Something went wrong!');
                toggleActive();
                setSaveLoading(false);
            }
        }
    }

    const handleproductdeletewarn = (productid, index) => {
        const data = { ...WarnStatus };
        data.productid = productid;
        data.productindex = index;
        data.productdeleteWarnactive = !data.productdeleteWarnactive;
        setWarnStatus(data);
    };
    const handlecollectiondeletewarn = (collectionid, index) => {
        const data = { ...WarnStatus };
        data.collectionid = collectionid;
        data.collectionindex = index;
        data.collectiondeleteWarnactive = !data.collectiondeleteWarnactive;
        setWarnStatus(data);
    };
    const ProductDelete = () => {
        handleproductdeletewarn();
        formik.setFieldValue('productState.productdeletebuttonLoader', true);
        deleteproducts(WarnStatus.productid, WarnStatus.productindex);
    };
    const deletecollections = (collectionid, collectionindex) => {
        const newcollectionids = [...formik.values.statusapplycollectionvalue];
        const index = newcollectionids.indexOf((collectionid).slice(25));
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
    const deleteproducts = (productid, index) => {
        const newproductids = { ...formik.values.statusapplayvalue };
        delete newproductids[productid];
        formik.setFieldValue('statusapplayvalue', newproductids);
        const newdata = [...formik.values.productState.productidsmaindata];
        const deleteddata = newdata.splice(index, 1);
        formik.setFieldValue('productState.productidsmaindata', newdata);
        formik.setFieldValue('productState.productdeletebuttonLoader', false);
        const backupproductidsnewdata = [];
        formik.values.productState.backupproductidsdata.map((data) => {
            if (data.productid !== deleteddata[0].productid) {
                backupproductidsnewdata.push(data);
            }
            return backupproductidsnewdata;
        }
        );
        formik.setFieldValue('productState.backupproductidsdata', backupproductidsnewdata);
    };
    const Getproduct = async (value, pagequery, cursor) => {
        let url = '/get_all_product?page_query=after';
        const pagecursor = !cursor ? '' : cursor;
        const pagequerydata = !pagequery ? 'after' : pagequery;
        if (value && value.length >= 3) {
            url = `/get_all_product?page_query=${pagequerydata}&search_key=${value}`;
        }
        const urldata = !value ? !pagecursor ? `/get_all_product?page_query=${pagequerydata}` : `/get_all_product?page_query=${pagequerydata}&cursor=${pagecursor}` : url;

        await GetApiCall('GET', urldata, { authentication: token }).then((res) => {
            if (res.data.statusCode === 200 && res.status === 200 && res.data.status === 'success') {
                const data = { ...dataproductState };
                // setProductloader(true)
                data.productNext_Page = res.data.data.pageInfo.hasNextPage;
                data.productPeriousPage = res.data.data.pageInfo.hasPreviousPage;
                data.productNextCursor = res.data.data.edges[res.data.data.edges.length - 1]?.cursor;
                data.productPreviousCursor = res.data.data.edges[0]?.cursor;
                data.productData = res.data.data?.edges;
                setdataproductState(data);
                setProductloader(false)
            } else {
                const data = { ...dataproductState };
                data.productData = [];
                setdataproductState(data);
            }
        }).catch(() => {
            const data = { ...dataproductState };
            data.productData = [];
            setdataproductState(data);
        });
    }

    const addproduct = () => {
        formik.setFieldValue('productState.producttablesearchValue', '');
        const mainarray = [];
        let dataobjects = {};
        let variantdata = {};
        const vararr = [];
        const oldData = [...formik.values.productState.productidsmaindata];
        const productids = dataproductState.productData.filter((item) => {
            return (
                Object.keys(formik.values.statusapplayvalue).includes(item?.node?.id.slice(22)) &&
                item
            );
        });
        const perpagedata = [];
        const perpagedatacursorSet = new Set();

        for (const data of [...formik.values.productState.perticularpageProductdata, ...productids]) {
            if (!perpagedatacursorSet.has(data.cursor)) {
                perpagedata.push(data);
                perpagedatacursorSet.add(data.cursor);
            }
        }

        if (perpagedata && perpagedata.length) {
            perpagedata.map(
                (data) => {
                    data?.node?.variants.edges.map((vardata) => {
                        variantdata = {
                            productid: data?.node?.id.slice(22),
                            variantid: vardata.node.id.slice(29),
                            tracksInventory: data?.node.tracksInventory,
                            inventoryQuantity: vardata.node.inventoryQuantity,
                            variandimg: vardata.node.image ? vardata.node.image.url : '',
                            varianttitle: vardata.node.title
                        };
                        vararr.push(variantdata);
                        return variantdata;
                    });

                    dataobjects = {
                        title: data?.node?.title,
                        url: data?.node?.featuredImage && data?.node?.featuredImage?.url,
                        selectedvarients: formik.values.statusapplayvalue[data?.node?.id.slice(22)] && formik.values.statusapplayvalue[data?.node?.id.slice(22)].length,
                        productid: data?.node?.id.slice(22),
                        totalVariants: data?.node?.totalVariants,
                        variantsdata: vararr.filter((item) => {
                            let valuestobereturn;
                            if (parseInt(item.productid) === parseInt(data?.node?.id.slice(22))) {
                                valuestobereturn = item;
                            }
                            return valuestobereturn;
                        })
                    };
                    mainarray.push(dataobjects);
                    return dataobjects;
                });
            const productMap = new Map();
            [...oldData, ...mainarray].forEach((data) => {
                data.productid = `${data.productid}`
                if (productMap.has(data.productid)) {
                    if (data.selectedvarients !== productMap.get(data.productid).selectedvarients) {
                        productMap.set(data.productid, data);
                    }
                } else {
                    productMap.set(data.productid, data);
                }
            });

            const mergedData = [...productMap.values()];
            const finalData = [];
            mergedData.map((data) => {
                data.selectedvarients = formik.values.statusapplayvalue[data?.productid] && formik.values.statusapplayvalue[data?.productid].length;
                finalData.push(data);
                return finalData;
            });

            formik.setFieldValue('productState.productidsmaindata', finalData);
            formik.setFieldValue('productState.backupproductidsdata', finalData);
            formik.setFieldValue('productState.activeProductModal', false);
            formik.setFieldValue('productState.activeProductVarientModal', false);

            if (formik.values.productState.removeProductId.length) {
                const updatedRemoveProductId = formik.values.productState.removeProductId.filter(id => !formik.values.statusapplayvalue[id]);
                const difference = finalData.filter(x => !updatedRemoveProductId.includes(x.productid));
                formik.setFieldValue('productState.productidsmaindata', difference);
                formik.setFieldValue('productState.backupproductidsdata', difference);
                formik.setFieldValue('productState.removeProductId', []);
            }
            formik.setFieldValue('productState.perticularpageProductdata', []);
            formik.setFieldValue('productState.productSearchValue', '');
            if (formik.values.productState.productSearchValue) {
                Getproduct();
            }
        }

    }

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
    const handleallproductsearch = (value) => {
        formik.setFieldValue('productState.productSearchValue', value);
        if (value && value.length >= 3) { Getproduct(value); }
        if (value === '') { Getproduct(value); }
    };
    const Getcollection = async (value, pagequery, cursor) => {
        let url = '/get_all_collection?page_query=after';
        const pagecursor = !cursor ? '' : cursor;
        const pagequerydata = !pagequery ? 'after' : pagequery;
        if (value && value.length >= 3) {
            url = `/get_all_collection?page_query=${pagequerydata}&search_key=${value}`;
        }
        const urldata = !value ? !pagecursor ? `/get_all_collection?page_query=${pagequerydata}` : `/get_all_collection?page_query=${pagequerydata}&cursor=${pagecursor}` : url;

        await GetApiCall('GET', urldata, { authentication: token }
        ).then((res) => {
            if (res.data.statusCode === 200 && res.status === 200 && res.data.status === 'success') {
                const data = { ...datacollectionState };
                data.collectionNext_Page = res.data.data.is_next_page;
                data.collectionPeriousPage = res.data.data.is_previous_page;
                data.collectionNextCursor = res.data.data.nxt_page_cursor;
                data.collectionPreviousCursor = res.data.data.prev_page_cursor;
                data.collectionData = res.data.data?.collections;
                setdatacollectionState(data);
                setProductloader(false)
            } else {
                const data = { ...datacollectionState };
                data.collectionData = [];
                setdatacollectionState(data);
            }
            // setProductloader(false);
        }).catch(() => {
            const data = { ...datacollectionState };
            data.collectionData = [];
            setdatacollectionState(data);
        });

    };

    const handleallcollectionsearch = (value) => {
        formik.setFieldValue('collectionState.collectionSearchValue', value);
        if (value && value.length >= 3) { Getcollection(value); }
        if (value === '') { Getcollection(value); }
    };
    
    const Getearnpoint = async () => {
        if (order_id) {
            await ApiCall('GET', `/get_place_an_order/${order_id}`, { id: parseInt(order_id) }, { authentication: token }).then((res) => {
                if (res.status === 200 && res.data.status === "SUCCESS") {
                    const editdata = res.data.data.checkStore
                    const globleProductData = res.data.data.globleProductData
                    if (globleProductData && Object.keys(globleProductData).length) {
                        if (parseInt(globleProductData.id) !== parseInt(order_id)) {
                            setIsGlobalAvailable(true);
                        }
                    }
                    const data = { ...initialvalue }
                    data.earningtitle = editdata.title
                    data.earningvalue = editdata.earning_value
                    data.statusapply = [editdata.status_apply]
                    data.priority = editdata.priority
                    setInitialPriority(parseInt(editdata.priority));
                    if (editdata.status_apply === '2') { // if product selected
                        const productdata = res.data.data.productData.getSelectedProduct
                        const product = editdata.product_id ? JSON.parse(editdata.product_id) : '';
                        let dataobjects = {}
                        let variantdata = {};
                        const variantimages = {};
                        const vararr = [];
                        const productarray = []
                        productdata && productdata.map((data) => {
                            const img = data.images.filter((imgdata) => {
                                let valuestobereturn;
                                if (imgdata.position === 1) {
                                    valuestobereturn = imgdata;
                                }
                                return valuestobereturn;
                            });
                            const Variantimg = data.images.filter((imgdata) => {
                                let valuestobereturn;
                                if (imgdata.position !== 1) {
                                    valuestobereturn = imgdata;
                                }
                                return valuestobereturn;
                            });

                            if (Variantimg) {
                                Variantimg.map((item) => {
                                    variantimages[item.id] = item.src;
                                    return variantimages;
                                });
                            }

                            const products = data
                            const produtvariant = data.allViants
                            produtvariant.map((vardata) => {
                                variantdata = {
                                    productid: data.id,
                                    variantid: vardata.id,
                                    tracksInventory: (vardata?.inventory_policy === 'deny' && vardata?.inventory_management === 'shopify'),
                                    inventoryQuantity: vardata.inventory_quantity,
                                    variandimg: variantimages[vardata?.image_id] ? variantimages[vardata.image_id] : '',
                                    varianttitle: vardata.title
                                };
                                vararr.push(variantdata);
                                return variantdata;
                            })

                            dataobjects = {
                                title: products.title,
                                url: img && img.length > 0 && img[0].src,
                                selectedvarients: JSON.parse(editdata.product_id)[products?.id] && JSON.parse(editdata.product_id)[products?.id].length,
                                productid: products.id,
                                totalVariants: products.totalVariants,
                                variantsdata: vararr.filter((item) => {
                                    let valuestobereturn;
                                    if (item.productid === products?.id) {
                                        valuestobereturn = item;
                                    }
                                    return valuestobereturn;
                                })
                            }
                            productarray.push(dataobjects)
                        })

                        data.statusapplayvalue = product
                        data.productState.productidsmaindata = productarray
                        data.productState.backupproductidsdata = productarray

                    } else if (editdata.status_apply === '3') {
                        data.statusapplycollectionvalue = [editdata.collection_id]
                        data.collectionState.collectionidsmaindata = [{
                            title: res.data.data.collectionData?.title,
                            collectionid: res.data.data.collectionData?.id
                        }]
                        data.collectionState.backupcollectionidsdata = [{
                            title: res.data.data.collectionData?.title,
                            collectionid: res.data.data.collectionData?.id
                        }]
                    }
                    data.status = editdata.reward_status
                    GetUsedProductData(data.statusapplayvalue);
                    Getusedcollection(data.statusapplycollectionvalue);
                    setInitialvalue(data)
                    setbackupInitialstate(data);
                } else {
                    setSaveActiveToastMessage(res?.data?.message);
                    toggleActive();
                }
            })
        }
        setloader(false)
    }
    const GetUsedProductData = async (statusapplayvalue) => {
        // const type = '1';
        // let res = await GetApiCall('GET', `/get_store_all_product/${type}`, { authentication: token });
        // if (res.data.status === 'SUCCESS' && res.status === 200) {
        //     // const detailData = res.data.data.length ? [...res.data.data[0]?.result?.getSelectedProduct] : [];
        //     const detailData = [...res.data.data];
        //     const finalDatas = order_id ? statusapplayvalue : formik.values.statusapplayvalue;
        //     const filteredIDObject = detailData.map((data) => JSON.parse(data.id));
        //     const mergedObj = {};
        //     if (res.data.data.length) {
        //         for (const obj of filteredIDObject) {
        //             if (JSON.stringify(finalDatas) !== JSON.stringify(obj)) {
        //                 for (const key in obj) {
        //                     if (obj.hasOwnProperty(key)) {
        //                         mergedObj[key] = (mergedObj[key] || []).concat(obj[key]);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     formik.setFieldValue('productState.productUsedData', mergedObj)
        //     // setInitialvalue({ ...initialvalue, productState: { ...initialvalue.productState, productUsedData: mergedObj } })
        // } else {
        //     setSaveActiveToastMessage(res?.data?.message);
        //     toggleActive();
        // }

    }
    const Getusedcollection = async (collectionvalue) => {
        // await GetApiCall('GET', '/get_store_all_collection/1', { authentication: token }).then((res) => {
        //     const collectiondata = res.data.data
        //     const finalData = order_id ? collectionvalue : formik.values.statusapplycollectionvalue;
        //     const arr = []
        //     collectiondata.map((data) => {
        //         let collectionId = data.result.collection.id.slice(25)
        //         if (!finalData.includes(collectionId)) {
        //             arr.push(collectionId)
        //         }
        //         setUsedcollection(arr)
        //     })
        // })
    }

    const GetGlobalExist = async () => {
        const res = await GetApiCall('GET', '/get_globle_product', { authentication: token });
        if (res.data.status === 'SUCCESS' && res.status === 200) {
            const detailData = res.data.data;
            if ((typeof detailData === 'object' && Object.keys(detailData).length)) {
                setIsGlobalAvailable(true);
                formik.setFieldValue('statusapply', ['2'])
            }
        }
    }

    const fetchData = async () => {
        Getproduct();
        Getcollection();
        if (order_id) {
            await Getearnpoint();
        } else {
            setloader(false)
            Getusedcollection();
            GetUsedProductData()
            await GetGlobalExist();
        }
    }

    useEffect(() => {
        if (token) {
            fetchData()
        }
    }, [token])

    const handleproductmodal = (activepopup) => {
        formik.setFieldValue('productState.activeProductModal', activepopup);
    }
    const handlecollectionmodal = (activepopup) => {
        formik.setFieldValue('collectionState.activecollectionModal', activepopup);
        formik.setFieldValue('collectionState.alreadySelectedStatusValue', formik.values.statusapplycollectionvalue)
    }
    const handleproductmodalclose = () => {
        formik.setFieldValue('productState.removeProductId', []);
        formik.setFieldValue('statusapplayvalue', formik.values.productState.backupProductids);
        if (formik.values.productState.productSearchValue) {
            Getproduct();
        }
        formik.setFieldValue('productState.productSearchValue', '');
        if (formik.values.productState.producttablesearchValue.length === 1) {
            formik.setFieldValue('productState.producttablesearchValue', '');
        }
    }
    const handleproductVarientmodelclose = () => {
        formik.setFieldValue('statusapplayvalue', formik.values.productState.varientBackupProductID);
    };
    const allproductsemptyStateMarkup = (
        <EmptySearchResult
            title={'Products not found'}
            description={'Try changing the search term'}
            withIllustration
        />
    );
    const selectedProductemptyStateMarkup = (
        <EmptySearchResult
            title={'Products not found'}
            description={'Try changing the search term'}
            withIllustration
        />
    );
    const selectedcollectionemptyStateMarkup = (
        <EmptySearchResult
            title={'Collection not found'}
            description={'Try changing the search term'}
            withIllustration
        />
    );

    const ProductVarientMarkup = formik.values.productState.productvarients && formik.values.productState.productvarients.length ? formik.values.productState.productvarients.map(
        (data, index) => (
            <IndexTable.Row key={index}>

                <div className={
                    (data.tracksInventory === true) ? (data.inventoryQuantity > 0) ? !(formik.values.productState.productUsedData[data.productid] && formik.values.productState.productUsedData[data.productid].includes(`${data?.variantid}`)) ? '' : 'ProductVarientIndexTable' : 'ProductVarientIndexTable' : ' '
                } onClick={() => {
                    if (data.tracksInventory === true) {
                        if (data.inventoryQuantity > 0) {
                            handleChangeProductsCheckbox(data?.variantid, 0, [], PerticularproductId);
                        }
                    } else {
                        handleChangeProductsCheckbox(data?.variantid, 0, [], PerticularproductId);
                    }
                }}>
                    <IndexTable.Cell>
                        <div className='productdata'>
                            <Checkbox
                                checked={formik.values.statusapplayvalue[PerticularproductId]?.includes(`${data?.variantid}`)}
                                disabled={
                                    (data.tracksInventory === true) ? ((data.inventoryQuantity > 0)) ? !(formik.values.productState.productUsedData[data.productid] && formik.values.productState.productUsedData[data.productid].includes(`${data?.variantid}`)) ? false : true : true : false
                                }
                            />
                            <Thumbnail
                                size='small'
                                source={data?.variandimg ? data?.variandimg : ImageMajor}
                                alt=""
                            />
                            <p>{data?.varianttitle}</p>
                        </div>
                    </IndexTable.Cell>
                    {(data.tracksInventory === true) ? (data?.inventoryQuantity > 0) ? !(formik.values.productState.productUsedData[data.productid] && formik.values.productState.productUsedData[data.productid].includes(`${data?.variantid}`)) ? <></> : <span className='soldoutbadge'><Badge status="info" >Selected</Badge></span> : <span className='soldoutbadge'> <Badge status="info">Sold out</Badge></span> : <></>}
                </div>
            </IndexTable.Row >
        )
    ) : [];


    const productVarientTotalPages = Math.ceil(ProductVarientMarkup.length / productRowsPerPage);
    const getItemsForproductVarient = (page) => {
        const pageNumber = page;
        const startIndex = (pageNumber - 1) * productRowsPerPage;
        const endIndex = startIndex + productRowsPerPage;
        const currentArray = ProductVarientMarkup;
        return currentArray.slice(startIndex, endIndex);
    };
    let productVarientToDisplay = getItemsForproductVarient(productVarientCurrentPage);
    if ((productVarientToDisplay.length === 0) && productVarientCurrentPage > 1) {
        productVarientToDisplay = getItemsForproductVarient(1);
        setproductVarientCurrentPage(1);
    }
    const editproducts = (Productids) => {
        setPerticularproductId(Productids);
        const data = formik.values.productState.productidsmaindata.filter((item) => {
            let valuestobereturn;
            if (parseInt(item.productid) === parseInt(Productids)) {
                valuestobereturn = item.variantsdata;
            }
            return valuestobereturn;
        });
        formik.setFieldValue('productState.productvarients', data[0].variantsdata);
        formik.setFieldValue('productState.activeProductVarientModal', true);
    };
    const SelectedProductRowMarkup = formik.values.productState.productidsmaindata && formik.values.productState.productidsmaindata.length ? formik.values.productState.productidsmaindata.map(
        (data, index) => (
            <IndexTable.Row id={index} key={index} position={index}>
                <IndexTable.Cell>
                    <div className='productlistingtable'>
                        <div className='productthumbnail'>
                            <Thumbnail
                                size='Small'
                                source={data?.url ? data?.url : ImageMajor}
                                alt=""
                            />
                            <div className='ps-2'>
                                <p>{data?.title}</p>
                                {data?.totalVariants > 1 && <p>({data?.selectedvarients} of {data?.totalVariants} variants selected)</p>}
                            </div>
                        </div>
                        <div className='productActionBtn'>
                            {data?.totalVariants > 1 && <Button variant='plain' onClick={() => { editproducts(data?.productid); }}>Edit</Button>}
                            <span
                                className='p-3'
                                onClick={() => { handleproductdeletewarn(data?.productid, index); }}
                            > <Icon
                                    source={DeleteMinor}
                                    color="base"
                                /></span>
                        </div>
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    ) : [];
    const handleChangeProductsCheckbox = (id, flag, variants, productId) => {
        id = `${id}`
        productId = `${productId}`
        const arr = [];
        const deletedId = [...formik.values.productState.removeProductId];
        const obj = { ...formik.values.statusapplayvalue };
        let finalID = '';
        if (flag === 1) {
            finalID = id.includes('gid') ? id.slice(22) : id;
        } else {
            finalID = id.includes('gid') ? id.slice(29) : id;
        }
        variants.map((item) => {
            const finalVarientID = item?.node?.id.includes('gid') ? item?.node?.id.slice(29) : item?.node?.id;
            if (flag === 1) {
                if (!(formik.values.productState.productUsedData[finalID] && formik.values.productState.productUsedData[finalID].includes(finalVarientID))) {
                    arr.push(finalVarientID);
                }
            }
            return arr;
        });
        if (flag === 1) {
            if (obj[finalID]) {
                deletedId.push(finalID);
                delete obj[finalID];
            } else {
                obj[finalID] = arr;
            }
            formik.setFieldValue('statusapplayvalue', obj);
        } else {
            productId = productId.includes('gid') ? productId.slice(22) : productId
            if (obj[productId]) {
                if (obj[productId].includes(finalID)) {
                    const abc = obj[productId].filter((item) => {
                        return (item !== finalID);
                    });
                    if (abc.length === 0) {
                        deletedId.push(productId);
                        delete obj[productId];
                    } else {
                        obj[productId] = abc;
                    }
                } else {
                    obj[productId].push(finalID);
                }
            } else {
                obj[productId] = [finalID];
            }
            formik.setFieldValue('statusapplayvalue', obj);
        }
        formik.setFieldValue('productState.removeProductId', deletedId);
    };

    const handleChangeCollectionCheckbox = (id) => {
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
    const productTotalPages = Math.ceil(SelectedProductRowMarkup.length / productRowsPerPage);
    const getItemsForproduct = (page) => {
        let pageNumber = page;
        if (formik.values.productState.producttablesearchValue && formik.values.productState.producttablesearchValue.length >= 3) {

            if (productCurrentPage > 1 && productFilterDataCheck === 1) {
                pageNumber = 1;
                setproductCurrentPage(1);
                setproductFilterDataCheck(0);
            }
        }

        const startIndex = (pageNumber - 1) * productRowsPerPage;
        const endIndex = startIndex + productRowsPerPage;
        const currentArray = SelectedProductRowMarkup;
        return currentArray.slice(startIndex, endIndex);
    };

    let productToDisplay = getItemsForproduct(productCurrentPage);
    if ((productToDisplay.length === 0) && productCurrentPage > 1) {
        productToDisplay = getItemsForproduct(1);
        setproductCurrentPage(1);
    }
    useEffect(() => {
        if (formik.values.productState.producttablesearchValue && formik.values.productState.producttablesearchValue.length >= 3) {
            setproductFilterDataCheck(productToDisplay);
        }
        if (formik.values.productState.producttablesearchValue === undefined || formik.values.productState.producttablesearchValue === '') {
            setproductFilterDataCheck(1);
        }
    }, [formik.values.productState.producttablesearchValue, productToDisplay]);

    const allproductmarkup = dataproductState.productData && dataproductState.productData.length > 0 ? dataproductState.productData?.map(
        (ite, i) => [
            <IndexTable.Row key={i}>
                <div onClick={() => { handleChangeProductsCheckbox(ite?.node?.id, 1, ite?.node?.variants.edges) }}>
                    <IndexTable.Cell>
                        <div className='productdata' >
                            <Checkbox
                                checked={Object.keys(formik.values.statusapplayvalue)?.includes(ite?.node?.id.includes('gid') ? ite?.node?.id.slice(22) : ite?.node?.id)}
                            // disabled={
                            //     (ite?.node?.tracksInventory === true) ? (ite?.node?.totalVariants === 1) ? (ite?.node?.variants.edges[0].node?.inventoryQuantity > 0) ? (!(formik.values.productState.productUsedData[ite?.node?.id.slice(22)])) ? false : true : true : (formik.values.productState.productUsedData[ite?.node?.id.slice(22)] && (formik.values.productState.productUsedData[ite?.node?.id.slice(22)].length === ite?.node?.totalVariants)) ? true : false : false
                            // }
                            />
                            <Thumbnail
                                size='small'
                                source={ite?.node?.featuredImage?.url ? ite?.node?.featuredImage?.url : ImageMajor}
                                alt=""
                            />
                            <p>{ite?.node?.title}</p>
                        </div>
                    </IndexTable.Cell>
                </div>
            </IndexTable.Row>,
            <>
                {ite?.node?.variants.edges.map((varientdata, varientindex) => {
                    if (varientdata.node.title !== 'Default Title') {
                        return (
                            <IndexTable.Row className='IndexTableProduct' key={varientindex}>
                                <div className={`productvarient`}
                                    onClick={() => { handleChangeProductsCheckbox(varientdata?.node?.id, 0, [], ite?.node?.id); }}>
                                    <IndexTable.Cell >
                                        <div className='varientdata'>
                                            <Checkbox
                                                checked={formik.values.statusapplayvalue[ite?.node?.id.includes('gid') ? ite?.node?.id.slice(22) : ite?.node?.id]?.includes(varientdata?.node?.id.includes('gid') ? varientdata?.node?.id.slice(29) : varientdata?.node?.id)}
                                            // disabled={
                                            //     (ite?.node?.tracksInventory === true) ? ((varientdata?.node?.inventoryQuantity > 0)) ? (!(formik.values.productState.productUsedData[ite?.node?.id.slice(22)] && formik.values.productState.productUsedData[ite?.node?.id.slice(22)].includes(varientdata?.node?.id.slice(29)))) ? false : true : true : false
                                            // }
                                            />
                                            <div>{varientdata.node.title}</div>
                                        </div>
                                    </IndexTable.Cell>
                                </div>
                            </IndexTable.Row>
                        );
                    } else {
                        return <></>;
                    }
                })
                }
            </>
        ]
    ) : [];
    const allcollectionmarkup = datacollectionState.collectionData && datacollectionState.collectionData.length > 0 ? datacollectionState.collectionData?.map(
        (ite, i) => [
            <IndexTable.Row key={i}>
                <div className={'IndexTableCell'} onClick={() => { handleChangeCollectionCheckbox((ite?.node?.id).slice(25)) }}>
                    <IndexTable.Cell >
                        <div className='productdata' >
                            <RadioButton
                                checked={formik.values.statusapplycollectionvalue?.includes((ite?.node?.id).slice(25))}
                                name="collections"
                                id={(ite?.node?.id).slice(25)}
                            // disabled={usedcollection.includes(ite?.node?.id.slice(25)) ? true : false}
                            />
                            <div>
                                <p>{ite?.node?.title}</p>
                            </div>
                        </div>
                    </IndexTable.Cell>
                </div>
            </IndexTable.Row>
        ]
    ) : [];

    const handledata = () => {
        const olddata = [...formik.values.productState.perticularpageProductdata];
        const productids = dataproductState.productData.filter((item) => {
            return (
                Object.keys(formik.values.statusapplayvalue).includes(item?.node?.id.slice(22)) &&
                item
            );
        });
        const newdata = [];
        const dataSet = new Set();
        for (const data of [...olddata, ...productids]) {
            if (!dataSet.has(data.cursor)) {
                newdata.push(data);
                dataSet.add(data.cursor);
            }
        }

        formik.setFieldValue('productState.perticularpageProductdata', newdata);
    };
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
    const cancelbtn = () => {
        formik.setFieldValue('statusapplayvalue', formik.values.productState.backupProductids ? formik.values.productState.backupProductids : {});
        formik.setFieldValue('productState.activeProductModal', false);
        if (formik.values.productState.productSearchValue && formik.values.productState.productSearchValue.length) {
            Getproduct();
        }
        formik.setFieldValue('productState.productSearchValue', '');
        formik.setFieldValue('productState.removeProductId', []);
        if (formik.values.productState.producttablesearchValue.length === 1) {
            formik.setFieldValue('productState.producttablesearchValue', '');
        }
    };
    const VarientModalcancelbtn = () => {
        formik.setFieldValue('statusapplayvalue', formik.values.productState.varientBackupProductID);
        formik.setFieldValue('productState.activeProductVarientModal', false);
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
    const deletemodal = () => {
        setshowdeletemodel(true)
    }
    const Deleteorder = async () => {
        setDeletespinner(true)
        await ApiCall('DELETE', '/delete_place_an_order', { id: Number(order_id) }, { authentication: token }).then((res) => {
            if (res.status === 200) {
                setshowdeletemodel(false)
                setSaveActiveToastMessage(res.data.message)
                toggleActive();
                setTimeout(() => {
                    navigate('/earnpoints')
                }, 1000)
            }
        })
        setDeletespinner(false)
    }

    return (
        <>
            <div className="placeanorder">
                {!loader ?
                    <Page backAction={{ content: 'Earnpoints', onAction: () => navigate('/earnpoints') }}
                        title="Place an order"
                        primaryAction={{ primary: true, content: order_id ? 'Save' : 'Create', loading: saveLoading, onAction: formik.handleSubmit, disabled: !formik.dirty }}>
                        <Layout>
                            <Layout.Section>
                                <Card title="Earning type" sectioned>
                                    <div className='title'>
                                        Earning title
                                    </div>
                                    <TextField
                                        type="text"
                                        value={formik.values.earningtitle}
                                        onChange={(value) => formik.setFieldValue('earningtitle', value)}
                                        autoComplete="off"
                                        onBlur={() => formik.setFieldTouched('earningtitle')}
                                        error={formik.touched.earningtitle && formik.errors.earningtitle ? formik.errors.earningtitle : ''}

                                    />
                                </Card>

                                <div className='pt-3'>
                                    <Card title="Earning type" sectioned>
                                        <div className='title'>
                                            Priority
                                        </div>
                                        <TextField
                                            type="number"
                                            min={0}
                                            placeholder='e.g. 1'
                                            value={formik.values.priority}
                                            onChange={(value) => formik.setFieldValue('priority', value)}
                                            autoComplete="off"
                                            onBlur={() => formik.setFieldTouched('priority')}
                                            error={formik.touched.priority && formik.errors.priority ? formik.errors.priority : ''}

                                        />
                                    </Card>
                                </div>

                                <div className="earningvalue">
                                    <Card title="Earning value">
                                        <div className='title'>
                                            Earning value
                                        </div>
                                        <div className="earnvalueinput">
                                            <TextField
                                                label={"Points earned for every RM1 spent"}
                                                type="number"
                                                min={0}
                                                placeholder='e.g. 100'
                                                value={formik.values.earningvalue >= 0 ? formik.values.earningvalue : ''}
                                                onChange={(value) => formik.setFieldValue('earningvalue', value)}
                                                autoComplete="off"
                                                suffix={'point'}
                                                onBlur={() => formik.setFieldTouched('earningvalue')}
                                                error={formik.touched && formik.touched.earningvalue && formik.errors.earningvalue}
                                            />
                                        </div>

                                        <Divider borderColor="border-inverse" />

                                        <div className='textcolor-size'>
                                            <Text as="h2" variant="bodyMd">
                                                Limit the number of times each collection can earn points for this action
                                            </Text>
                                        </div>
                                    </Card>
                                </div>


                                <Card title="Status" sectioned>
                                    <div className='title'>
                                        Status
                                    </div>
                                    <ChoiceList
                                        choices={[
                                            { label: 'Globally', value: '1', disabled: isGlobalAvailable },
                                            { label: 'Specific product', value: '2', renderChildren },
                                            { label: 'Specific collection', value: '3', renderChildren },

                                        ]}
                                        selected={formik.values.statusapply}
                                        onChange={(value) => formik.setFieldValue('statusapply', value)}
                                    />

                                </Card>
                            </Layout.Section>

                            <Layout.Section variant="oneThird">
                                <Card title="STATUS" sectioned>
                                    <div className='title'>
                                        STATUS
                                    </div>
                                    <ChoiceList
                                        choices={[
                                            { label: 'Active', value: '1' },
                                            { label: 'Disabled', value: '2' },
                                        ]}
                                        selected={formik.values.status}
                                        onChange={(value) => formik.setFieldValue('status', value)}
                                    />
                                </Card>
                                <div className="Icon">
                                    <Card title="Icon">
                                        <div className="statusicon">
                                            <ChoiceList
                                                choices={[
                                                    { label: 'Default', value: '1' },

                                                ]}
                                                selected={formik.values.icon}
                                                onChange={(value) => formik.setFieldValue('icon', value)}
                                            />
                                            <div className="thumbnail">
                                                <Thumbnail
                                                    source="https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg?theme=light&amp;color=%236568FE"
                                                    alt=""
                                                />
                                            </div>
                                        </div>

                                        <Divider borderColor="border-inverse" />
                                        <div className='textcolor-size'>
                                            <Text as="h2" variant="bodyMd">
                                                This what your collection will see in  UI. <Button variant='plain'>Learn more</Button> about actions
                                            </Text>
                                        </div>

                                    </Card>
                                </div>

                            </Layout.Section>
                            {toastMarkup}
                        </Layout>
                        <div className="divider">
                            <Divider borderColor="border-inverse" />
                        </div>
                        <div className={order_id ? "Polaris-ButtonGroup justify-content-between mt-4" : "Polaris-ButtonGroup justify-content-end mt-4"}>
                            {order_id ? <Button variant="primary" tone="critical" onClick={() => deletemodal()}>Delete</Button> : ''}
                            <Button variant="primary" loading={saveLoading} onClick={() => formik.handleSubmit()} disabled={!formik.dirty}>{order_id ? 'Save' : 'Create'}</Button>
                        </div>

                    </Page> : <div className="page_loader" key="loader">
                        <Spinner size="large" />
                    </div>}
            </div>
            <div className="productmodal">
                <Modal
                    open={formik.values.productState.activeProductModal}
                    onClose={() => {
                        formik.setFieldValue('productState.activeProductModal', false);
                        handleproductmodalclose();
                    }}
                    title="Specific product"
                    onTransitionEnd={() => {
                        formik.setFieldValue('productState.backupProductids', JSON.parse(JSON.stringify(formik.values.statusapplayvalue)));
                        formik.setFieldValue('productState.productcheckValues', false);
                    }}
                    primaryAction={{
                        content: 'Done',
                        onAction: () => addproduct(),
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => cancelbtn(),
                        },
                    ]}
                    footer={
                        (!dataproductState.productData && (formik.values.productState.productSearchValue === '' || formik.values.productState.productSearchValue?.length >= 0)) ? (<></>) : (
                            <div>
                                <div className='footercontect'>
                                    <div className='paginationContent'>
                                        {(dataproductState.productPeriousPage === true || dataproductState.productNext_Page === true) ? (
                                            <>
                                                <Pagination
                                                    previousTooltip="Previous"
                                                    nextTooltip='Next'
                                                    hasPrevious={dataproductState.productPeriousPage > 0}
                                                    onPrevious={() => {
                                                        Getproduct(formik.values.productState.productSearchValue, 'before', dataproductState.productPreviousCursor);
                                                        handledata();
                                                        setProductloader(true);
                                                    }}
                                                    hasNext={dataproductState.productNext_Page >= 1}
                                                    onNext={() => {
                                                        Getproduct(formik.values.productState.productSearchValue, 'after', dataproductState.productNextCursor);
                                                        handledata();
                                                        setProductloader(true);
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
                                    value={formik.values.productState.productSearchValue}
                                    placeholder='Search'
                                    autoComplete='off'
                                    onChange={(value) => { handleallproductsearch(value); handledata(); }}
                                    onClearButtonClick={() => {
                                        formik.setFieldValue('productState.productSearchValue', '');
                                        Getproduct();
                                    }}
                                />
                            </div>
                            <div className="producttable">
                                {!productloader ?
                                    <IndexTable
                                        itemCount={dataproductState.productData.length}
                                        headings={[[]]}
                                        selectable={false}
                                        emptyState={allproductsemptyStateMarkup}
                                    >
                                        {allproductmarkup}
                                    </IndexTable> : <div className="page_loader" key="loader">
                                        <Spinner size="large" />
                                    </div>}
                            </div>
                        </div>

                    </Modal.Section>
                </Modal>
            </div >
            <div className="productvariant">
                <Modal
                    open={formik.values.productState.activeProductVarientModal}
                    onClose={() => {
                        formik.setFieldValue('productState.activeProductVarientModal', false);
                        handleproductVarientmodelclose();
                    }}
                    title="Edit Variant"
                    primaryAction={{
                        content: 'Done',
                        onAction: () => addproduct(),
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => VarientModalcancelbtn(),
                        },
                    ]}
                    onTransitionEnd={() => {
                        formik.setFieldValue('productState.varientBackupProductID', JSON.parse(JSON.stringify(formik.values.statusapplayvalue)));
                        formik.setFieldValue('productState.productcheckValues', false);
                    }}
                    footer={
                        (!dataproductState.productData && (formik.values.productState.productSearchValue === '' || formik.values.productState.productSearchValue?.length >= 0)) ? (<></>) : (
                            <div>
                                <div className='footercontect'>
                                    <div className='paginationContent'>
                                        {productVarientTotalPages > 1 ? <>
                                            <Pagination
                                                previousTooltip="Previous"
                                                nextTooltip='Next'
                                                hasPrevious={productVarientCurrentPage > 1}
                                                onPrevious={() => { setproductVarientCurrentPage(parseInt(productVarientCurrentPage) - 1); }}
                                                hasNext={productVarientCurrentPage < productVarientTotalPages}
                                                onNext={() => { setproductVarientCurrentPage(parseInt(productVarientCurrentPage) + 1); }}
                                            />
                                        </> : ''}
                                    </div>

                                </div>
                            </div>
                        )
                    }
                >
                    <Modal.Section>
                        <div className='productselecttable'>
                            <IndexTable
                                itemCount={formik.values.productState.productvarients.length}
                                headings={[[]]}
                                selectable={false}
                                emptyState={allproductsemptyStateMarkup}
                            >
                                {productVarientToDisplay}
                            </IndexTable>
                        </div>

                    </Modal.Section>
                </Modal>
            </div >
            <div className="productdelete">
                <Modal
                    open={WarnStatus.productdeleteWarnactive}
                    onClose={handleproductdeletewarn}
                    title='Delete Product'
                    primaryAction={{
                        content: 'Delete',
                        onAction: ProductDelete,
                        destructive: true,
                        loading: formik.values.productState.productdeletebuttonLoader
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: handleproductdeletewarn
                        }
                    ]}
                >
                    <Modal.Section>
                        <div className='ps-3'>Are you sure, you want to delete this product </div>
                    </Modal.Section>
                </Modal>
            </div>

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
                                                        setProductloader(true);
                                                    }}
                                                    hasNext={datacollectionState.collectionNext_Page >= 1}
                                                    onNext={() => {
                                                        Getcollection(formik.values.collectionState.collectionSearchValue, 'after', datacollectionState.collectionNextCursor);
                                                        handlecollectiondata();
                                                        setProductloader(true);
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
                                {!productloader ? <IndexTable
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
            </div>
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
            <div className="earnpointdeletemodal">
                <Modal
                    open={showdeletemodel}
                    onClose={handleDelete}
                    title='Delete collection'
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
                        <Text>Are you sure, you want to delete  </Text>
                    </Modal.Section>
                </Modal>
            </div>
        </>
    )
}

export default Placeanorder
