import React, { useState, useEffect, useCallback } from 'react'
import { Page, Layout, Grid, Text, Button, Toast, TextField, RadioButton, Card, EmptySearchResult, Thumbnail, IndexTable, PageActions, Badge, Checkbox, Spinner, Pagination, Modal, Icon } from '@shopify/polaris';
import { DeleteMinor, ImageMajor, SearchMinor } from '@shopify/polaris-icons';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { useNavigate, useParams } from 'react-router-dom'
import { ApiCall, GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

const FreeProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const store_client_id = store_data?.shop_data?.store_client_id;
    const headers = { authentication: token };
    const [saveActiveToast, setSaveActiveToast] = useState(false);
    const [saveActiveToastMessage, setSaveActiveToastMessage] = useState('');
    const [loading, setLoading] = useState(id ? true : false);
    const [saveloading, setSaveLoading] = useState(false);
    const [productloader, setProductloader] = useState(false);
    const [deleteloading, setDeleteLoading] = useState(false);
    const [isDeleteReward, setIsDeleteReward] = useState(false);
    const [productCurrentPage, setproductCurrentPage] = useState(1);
    const [productRowsPerPage] = useState(10);
    const [PerticularproductId, setPerticularproductId] = useState();
    const [productFilterDataCheck, setproductFilterDataCheck] = useState([]);
    const [productVarientCurrentPage, setproductVarientCurrentPage] = useState(1);
    const [WarnStatus, setWarnStatus] = useState({
        productdeleteWarnactive: false,
        productid: '',
        productindex: '',
        collectiondeleteWarnactive: false,
        collectionindex: '',
        collectionid: ''
    });
    const [dataproductState, setdataproductState] = useState({
        productNext_Page: 1,
        productPeriousPage: 1,
        productNextCursor: '',
        productPreviousCursor: '',
        productData: []
    });

    const [initialState, setInitialState] = useState({
        title: '',
        products: '',
        point_cost: '',
        min_requirement: '1',
        min_purchase_amount: 0,
        expire_day: '',
        status: '1',
        icon_type: '1',
        certain_collection: 0,
        statusapplayvalue: {},
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
        }
    });

    const toggleActive = useCallback(() => setSaveActiveToast((saveActiveToast) => !saveActiveToast), []);

    const toastMarkup = saveActiveToast ? (
        <Toast content={saveActiveToastMessage} onDismiss={toggleActive} />
    ) : null;

    const validationSchema = Yup.object().shape({
        title: Yup.string().nullable().required('Title is required'),
        point_cost: Yup.number().nullable().min(1,"Point const must be greater than 0").required('Points cost is required'),
        min_purchase_amount: Yup.number().when('min_requirement', (min_requirement, field) => min_requirement[0] === '2' ? field.required('Min purchase amount is required') : field),
        expire_day: Yup.number().nullable().required('expire days is required').min(1, "Expiry day must be greater than 0"),
        certain_collection: Yup.string().when('applies_to', (applies_to, field) => applies_to[0] === '2' ? field.required('certain collection is required') : field)
    })

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setSaveLoading(true);
            const ProductData = {};
            const product = formik.values.statusapplayvalue;
            Object.keys(product).map((item) => {
                ProductData[item] =
                    product[item].map((varients) => {
                        return varients;
                    });
            });

            const data = {
                store_client_id: store_client_id,
                title: values.title,
                point_cost: parseFloat(values.point_cost),
                minimum_requirement: values.min_requirement,
                ...(values.min_requirement) === '2' && { minimum_purchase_amount: parseFloat(values.min_purchase_amount) },
                expire_day: parseFloat(values.expire_day),
                reward_status: values.status,
                product_id: ProductData,
            }
            if (!id) {
                const res = await ApiCall('POST', '/free_Product', data, { authentication: token });
                if (res.data.status === 'SUCCESS' && res.status === 200) {
                    setSaveActiveToastMessage(res.data.message);
                    toggleActive();
                    setTimeout(() => {
                        navigate('/redeem-points');
                    }, 1000);
                }
            } else {
                data.id = parseInt(id);
                const res = await ApiCall('PUT', '/update_free_product', data, headers);
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

    const handleallproductsearch = (value) => {
        formik.setFieldValue('productState.productSearchValue', value);
        if (value && value.length >= 3) { Getproduct(value); }
        if (value === '') { Getproduct(value); }
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
            const data = { ...dataproductState };
            data.productNext_Page = res.data.data.pageInfo.hasNextPage;
            data.productPeriousPage = res.data.data.pageInfo.hasPreviousPage;
            data.productNextCursor = res.data.data.edges[res.data.data.edges.length - 1]?.cursor;
            data.productPreviousCursor = res.data.data.edges[0]?.cursor;
            data.productData = res.data.data?.edges;
            setdataproductState(data);
            setProductloader(false);
        }).catch(() => {
            const data = { ...dataproductState };
            data.productData = [];
            setdataproductState(data);
            setProductloader(false);
        });
    }

    const GetAmountData = async () => {
        setLoading(true);
        const res = await GetApiCall('GET', `/freeProduct_get/${id}`, { authentication: token });
        if (res.data.status === "SUCCESS" && res.status === 200) {
            const detailData = res.data.data.checkStore;
            const finalProductData = res.data.data.productData.getSelectedProduct;
            const data = { ...initialState };
            data.title = detailData.title
            data.point_cost = detailData.point_cost
            data.min_requirement = detailData.minimum_requirement
            if (detailData.minimum_requirement === '2') {
                data.min_purchase_amount = detailData.minimum_purchase_amount
            }
            data.expire_day = detailData.expire_day
            data.status = detailData.reward_status
            data.icon_type = detailData.icon

            const ProductData = {};
            const product = detailData.product_id ? JSON.parse(detailData.product_id) : '';
            Object.keys(product).map((item) => {
                ProductData[item] =
                    product[item].map((varients) => {
                        return varients;
                    });
            });

            const productarray = []
            if (finalProductData.length) {
                let dataobjects = {}
                let variantdata = {};
                const variantimages = {};
                const vararr = [];

                finalProductData && finalProductData.map((data) => {
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
                        selectedvarients: JSON.parse(detailData.product_id)[products?.id] && JSON.parse(detailData.product_id)[products?.id].length,
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
            }
            data.statusapplayvalue = ProductData;
            data.productState.productidsmaindata = productarray
            data.productState.backupproductidsdata = productarray
            GetUsedProductData(ProductData);
            setInitialState(data);
            setLoading(false);
        }
    }
    const handlesearchfromproductdata = (value) => {
        formik.setFieldValue('productState.producttablesearchValue', value);
        if (value && formik.values.productState.productidsmaindata.length === 0) {
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

    const GetUsedProductData = async (statusapplayvalue) => {
        // const type = '2'; // 2 == redeem ponits
        // let res = await GetApiCall('GET', `/get_store_all_product/${type}`, { authentication: token });
        // if (res.data.status === 'SUCCESS' && res.status === 200) {
        //     const detailData = [...res.data.data];
        //     const finalDatas = id ? statusapplayvalue : formik.values.statusapplayvalue;
        //     const mergedObj = {};
        //     if (detailData.length) {
        //         const filteredIDObject = detailData.map((data) => JSON.parse(data.id));
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
        //     // setInitialState({ ...initialState, productState: { ...initialState.productState, productUsedData: obj } })
        // } else {
        //     setSaveActiveToastMessage(res?.data?.message);
        //     toggleActive();
        // }

    }

    const fetchData = async () => {
        Getproduct()
        if (id) {
            await GetAmountData();
        } else {
            GetUsedProductData();
        }

    }

    useEffect(() => {
        if (token) {
            fetchData()
        }
    }, [token])

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
                    let productID = data?.node?.id.includes('gid') ? data?.node?.id.slice(22) : data?.node?.id;
                    dataobjects = {
                        title: data?.node?.title,
                        url: data?.node?.featuredImage && data?.node?.featuredImage?.url,
                        selectedvarients: formik.values.statusapplayvalue[productID] && formik.values.statusapplayvalue[productID].length,
                        productid: productID,
                        totalVariants: data?.node?.totalVariants,
                        variantsdata: vararr.filter((item) => {
                            let valuestobereturn;
                            if (parseInt(item.productid) === parseInt(productID)) {
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

    const handleproductdeletewarn = (productid, index) => {
        const data = { ...WarnStatus };
        data.productid = productid;
        data.productindex = index;
        data.productdeleteWarnactive = !data.productdeleteWarnactive;
        setWarnStatus(data);
    };
    const ProductDelete = () => {
        handleproductdeletewarn();
        formik.setFieldValue('productState.productdeletebuttonLoader', true);
        deleteproducts(WarnStatus.productid, WarnStatus.productindex);
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


    const handleproductmodal = (activepopup) => {
        formik.setFieldValue('productState.activeProductModal', activepopup);
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

    const ProductVarientMarkup = formik.values.productState.productvarients && formik.values.productState.productvarients.length ? formik.values.productState.productvarients.map(
        (data, index) => (
            <IndexTable.Row key={index}>
                <div onClick={() => { handleChangeProductsCheckbox(data?.variantid, 0, [], PerticularproductId) }}>
                    <IndexTable.Cell>
                        <div className='productdata'>
                            <Checkbox
                                checked={formik.values.statusapplayvalue[PerticularproductId]?.includes(`${data?.variantid}`)}
                            /* disabled={
                                (data.tracksInventory === true) ? ((data.inventoryQuantity > 0)) ? !(formik.values.productState.productUsedData[data.productid] && formik.values.productState.productUsedData[data.productid].includes(`${data?.variantid}`)) ? false : true : true : false
                            } */
                            />
                            <Thumbnail
                                size='small'
                                source={data?.variandimg ? data?.variandimg : ImageMajor}
                                alt=""
                            />
                            <p>{data?.varianttitle}</p>
                        </div>
                    </IndexTable.Cell>
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
                            <div className='ps-2 text-break'>
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
    const allproductmarkup = dataproductState.productData && dataproductState.productData.length > 0 ? dataproductState.productData?.map(
        (ite, i) => [
            <IndexTable.Row key={i}>
                <div onClick={() => {
                    if (!(Object.keys(formik.values.statusapplayvalue).length && !(Object.keys(formik.values.statusapplayvalue)?.includes(ite?.node?.id.includes('gid') ? ite?.node?.id.slice(22) : ite?.node?.id)))) {
                        handleChangeProductsCheckbox(ite?.node?.id, 1, ite?.node?.variants.edges)
                    }
                }}
                    className={`${(Object.keys(formik.values.statusapplayvalue).length && !(Object.keys(formik.values.statusapplayvalue)?.includes(ite?.node?.id.includes('gid') ? ite?.node?.id.slice(22) : ite?.node?.id))) ? 'IndexTableProduct' : ''}`}>
                    <IndexTable.Cell>
                        <div className='productdata'>
                            <Checkbox
                                checked={Object.keys(formik.values.statusapplayvalue)?.includes(ite?.node?.id.includes('gid') ? ite?.node?.id.slice(22) : ite?.node?.id)}
                                disabled={
                                    (Object.keys(formik.values.statusapplayvalue).length && !(Object.keys(formik.values.statusapplayvalue)?.includes(ite?.node?.id.includes('gid') ? ite?.node?.id.slice(22) : ite?.node?.id)))
                                }
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
                        let productID = ite?.node?.id?.includes('gid') ? ite?.node?.id?.slice(22) : ite?.node?.id;
                        let varientID = varientdata?.node?.id?.includes('gid') ? varientdata?.node?.id?.slice(29) : varientdata?.node?.id;
                        return (
                            <IndexTable.Row className='IndexTableProduct' key={varientindex}>
                                <div className={`productvarient ${(Object.keys(formik.values.statusapplayvalue).length && !(formik.values.statusapplayvalue?.[productID])) ? 'IndexTableProduct' : ''}`}
                                    onClick={() => {
                                        if (!(Object.keys(formik.values.statusapplayvalue).length && !(formik.values.statusapplayvalue?.[productID]))) {
                                            handleChangeProductsCheckbox(varientdata?.node?.id, 0, [], ite?.node?.id)
                                        }
                                    }}>
                                    <IndexTable.Cell >
                                        <div className='varientdata'>
                                            <Checkbox
                                                checked={formik.values.statusapplayvalue?.[productID]?.includes(varientID)}
                                                disabled={
                                                    ((Object.keys(formik.values.statusapplayvalue).length && !(formik.values.statusapplayvalue?.[productID])))
                                                }
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

    const deleteReward = async (id) => {
        setDeleteLoading(true);
        const res = await ApiCall('DELETE', '/delete_free_product', { id: parseInt(id) }, { authentication: token });
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
                <TitleBar title='Free Product' breadcrumbs={redeemPointsBreadcrumb} />
            </Provider> : <></>}
            {!loading ? <div className='fix-amount-discount-page amount-pages'>
                <Page
                    title='Free Product'
                    backAction={{ content: 'Products', onAction: () => navigate('/redeem-points') }}
                    primaryAction={{ primary: true, content: 'Save', loading: saveloading, disabled: !formik.dirty, onAction: formik.handleSubmit }}
                >
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
                                        Choose Product
                                    </h6>
                                    <div className="searchfield">
                                        <TextField
                                            value={formik.values.productState.producttablesearchValue}
                                            placeholder='Search'
                                            prefix={<Icon source={SearchMinor} />}
                                            autoComplete='off'
                                            onChange={(value) => { handlesearchfromproductdata(value) }}
                                            connectedRight={
                                                <Button size='large' onClick={() => handleproductmodal(true)}>Browse</Button>
                                            }
                                        />
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
                                                        {productTotalPages > 1 ? <div className='productData-pagination'>
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
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Reward value
                                    </h6>
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                                            <div className=''>
                                                <TextField
                                                    label="Points cost"
                                                    type="number"
                                                    placeholder='e.g. 100'
                                                    suffix='points'
                                                    min={0}
                                                    value={formik.values.point_cost}
                                                    onChange={(value) => { formik.setFieldValue('point_cost', value) }}
                                                    onBlur={() => formik.setFieldTouched('point_cost')}
                                                    error={formik.touched.point_cost && formik.errors.point_cost ? formik.errors.point_cost : ''}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
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
                                                min={0}
                                                prefix="RM"
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
                                            type="number"
                                            placeholder='e.g. 10'
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
                                        <div className="Polaris-ChoiceList__ChoiceChildren">
                                            <span className="Polaris-Thumbnail  Polaris-Thumbnail--sizeMedium">
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
                                                {(dataproductState.productPeriousPage || dataproductState.productNext_Page) ? (
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
                                        {!productloader ? <IndexTable
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
                    </div>
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
                    </div>

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
            </div> : <div className='page-loader'><Spinner accessibilityLabel="Spinner example" size="large" /></div>}
        </>
    )
}

export default FreeProduct