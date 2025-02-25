import React, { useState, useCallback, useEffect } from 'react'
import { Page, Layout, Text, Checkbox, Toast, TextField, RadioButton, Spinner, PageActions, Modal, Card } from '@shopify/polaris'
import { useFormik } from 'formik';
import * as Yup from "yup";
import { useNavigate, useParams } from 'react-router-dom'
import { ApiCall, GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

const FreeShipping = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const store_client_id = store_data?.shop_data?.store_client_id;
    const headers = { authentication: token };
    const [saveActiveToast, setSaveActiveToast] = useState(false);
    const [loading, setLoading] = useState(id ? true : false);
    const [saveloading, setSaveLoading] = useState(false);
    const [deleteloading, setDeleteLoading] = useState(false);
    const [isDeleteReward, setIsDeleteReward] = useState(false);
    const [saveActiveToastMessage, setSaveActiveToastMessage] = useState('');
    const [initialState, setInitialState] = useState({
        title: '',
        point_cost: '',
        is_max_ship_amount: '2',
        max_ship_amount: '',
        expire_day: '',
        status: '1',
        icon_type: '1'
    });

    const toggleActive = useCallback(() => setSaveActiveToast((saveActiveToast) => !saveActiveToast), []);

    const toastMarkup = saveActiveToast ? (
        <Toast content={saveActiveToastMessage} onDismiss={toggleActive} />
    ) : null;

    const validationSchema = Yup.object().shape({
        title: Yup.string().nullable().required('Title is required'),
        point_cost: Yup.number().nullable().min(1, "point cost must be greater than 0").required('points is required'),
        max_ship_amount: Yup.number().min(1, "Value must be greater than 0").when('is_max_ship_amount', (is_max_ship_amount, field) => is_max_ship_amount[0] === '1' ? field.required('Max ship amount is required') : field),
        expire_day: Yup.number().nullable().required('Days is required').min(1, "Expiry day must be greater than 0"),
        certain_collection: Yup.string().when('applies_to', (applies_to, field) => applies_to[0] === '2' ? field.required('certain collection is required') : field)
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
                point_cost: parseFloat(values.point_cost),
                maximum_shipping_status: values.is_max_ship_amount,
                ...(values.is_max_ship_amount) === '1' && { maximum_shipping_amount: parseFloat(values.max_ship_amount) },
                expire_day: parseFloat(values.expire_day),
                reward_status: values.status,
            }
            if (!id) {
                const res = await ApiCall('POST', '/free_shipping', data, headers);
                if (res.data.status === 'SUCCESS' && res.status === 200) {
                    setSaveActiveToastMessage(res.data.message);
                    toggleActive();
                    setTimeout(() => {
                        navigate('/redeem-points');
                    }, 1000);
                }
            } else {
                data.id = parseInt(id);
                const res = await ApiCall('PUT', '/update_free_shipping', data, headers);
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

    const GetAmountData = async () => {
        setLoading(true);
        const res = await GetApiCall('GET', `/freeShipping_get/${id}`, { authentication: token });
        if (res.data.status === "SUCCESS" && res.status === 200) {
            const detailData = res.data.data;
            const data = { ...initialState };
            data.title = detailData.title
            data.point_cost = detailData.point_cost
            data.is_max_ship_amount = detailData.maximum_shipping_status
            if (detailData.maximum_shipping_status === '1') {
                data.max_ship_amount = detailData.maximum_shipping_amount
            }
            data.expire_day = detailData.expire_day
            data.status = detailData.reward_status
            data.icon_type = detailData.icon
            setInitialState(data);
            setLoading(false);
        } else {
            setSaveActiveToastMessage(res?.data?.message);
            toggleActive();
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token && id) {
            GetAmountData();
        }
    }, [token]);

    const deleteReward = async (id) => {
        setDeleteLoading(true);
        const res = await ApiCall('DELETE', '/delete_free_shipping', { id: parseInt(id) }, { authentication: token });
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
                <TitleBar title='Free Shipping' breadcrumbs={redeemPointsBreadcrumb} />
            </Provider> : <></>}
            {!loading ? <div className='fix-amount-discount-page amount-pages'>
                <Page
                    title='Free Shipping'
                    backAction={{ content: 'Products', onAction: () => navigate('/redeem-points') }}
                    primaryAction={{ primary: true, content: 'Save', disabled: !formik.dirty, loading: saveloading, onAction: formik.handleSubmit }}
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
                                        Reward value
                                    </h6>
                                    <TextField
                                        label="Points cost"
                                        type="number"
                                        min={0}
                                        suffix='points'
                                        placeholder='e.g. 100'
                                        value={formik.values.point_cost}
                                        onChange={(value) => { formik.setFieldValue('point_cost', value) }}
                                        onBlur={() => formik.setFieldTouched('point_cost')}
                                        error={formik.touched.point_cost && formik.errors.point_cost ? formik.errors.point_cost : ''}
                                        autoComplete="off"
                                    />
                                    <Checkbox
                                        label="Set a maximum shipping amount this reward can be applied to"
                                        checked={formik.values.is_max_ship_amount === '1'}
                                        onChange={() => { formik.setFieldValue('is_max_ship_amount', formik.values.is_max_ship_amount === '1' ? '2' : '1'); }}
                                    />
                                    {formik.values.is_max_ship_amount === '1' && <div className='margin-left-input'>
                                        <TextField
                                            type="number"
                                            min={0}
                                            suffix="RM"
                                            placeholder='e.g 100'
                                            value={formik.values.max_ship_amount}
                                            onChange={(value) => { formik.setFieldValue('max_ship_amount', value) }}
                                            onBlur={() => formik.setFieldTouched('max_ship_amount')}
                                            error={formik.touched.max_ship_amount && formik.errors.max_ship_amount ? formik.errors.max_ship_amount : ''}
                                            autoComplete="off"
                                        />
                                    </div>}
                                </Card>
                            </div>
                            <div className='pb-3'>
                                <Card>
                                    <h6 className='polaris-header-title'>
                                        Discount has expiry of x days
                                    </h6>
                                    <TextField
                                        type="number"
                                        min={0}
                                        label="X days"
                                        placeholder='e.g 10'
                                        value={formik.values.expire_day}
                                        onChange={(value) => { formik.setFieldValue('expire_day', value) }}
                                        onBlur={() => formik.setFieldTouched('expire_day')}
                                        error={formik.touched.expire_day && formik.errors.expire_day ? formik.errors.expire_day : ''}
                                        autoComplete="off"
                                    />
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

export default FreeShipping