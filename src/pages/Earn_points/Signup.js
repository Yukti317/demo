import { Button, Card, ChoiceList, Divider, Layout, Modal, Page, Spinner, Text, TextField, Thumbnail, Toast } from '@shopify/polaris'
import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { ApiCall, GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

function Signup() {
    const { signup_id } = useParams();
    const store_data = useSelector((state) => state.commonData.store_data);
    const store_client_id = store_data?.shop_data?.store_client_id;
    const token = store_data?.token;
    const navigate = useNavigate();
    const [saveActiveToast, setSaveActiveToast] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveActiveToastMessage, setSaveActiveToastMessage] = useState('');
    const [showdeletemodel, setshowdeletemodel] = useState(false);
    const handleDelete = () => setshowdeletemodel(!showdeletemodel);
    const [Deletespinner, setDeletespinner] = useState(false);
    const [initialvalue, setInitialvalue] = useState({
        earningtitle: '',
        status: '1',
        icon: '1',
        earningvalue: ''
    })
    const [loader, setloader] = useState(false);
    const toggleActive = useCallback(() => setSaveActiveToast((saveActiveToast) => !saveActiveToast), []);

    const toastMarkup = saveActiveToast ? (
        <Toast content={saveActiveToastMessage} onDismiss={toggleActive} />
    ) : null;
    const formik = useFormik({
        initialValues: initialvalue,
        enableReinitialize: true,
        validationSchema: Yup.object({
            earningtitle: Yup.string().required('Title is required'),
            earningvalue: Yup.number().required('Earning value is required').min(1, 'Earning value is must be greater than 0')
        }),
        onSubmit: () => { CreateUpdate() }
    })
    const CreateUpdate = async () => {
        setSaveLoading(true);
        const data = {
            store_client_id: store_client_id,
            title: formik.values.earningtitle,
            earning_value: Number(formik.values.earningvalue),
            reward_status: formik.values.status[0],
            ...signup_id && { id: signup_id }
        }
        if (signup_id) {
            await ApiCall('PUT', `/update_signup_reward`, data, { authentication: token }).then((res) => {
                if (res.status === 200) {
                    setSaveActiveToastMessage(res.data.message)
                    toggleActive();
                    setTimeout(() => {
                        navigate('/earnpoints')
                    }, 1000);
                }
            })

        } else {
            await ApiCall('POST', '/signup_reward', data, { authentication: token }).then((res) => {
                if (res.status === 200) {
                    setSaveActiveToastMessage(res.data.message)
                    toggleActive();
                    setTimeout(() => {
                        navigate('/earnpoints')
                    }, 1000);
                }

            })
        }
    }
    const Getsignup = async () => {
        if (signup_id) {
            const data = { ...initialvalue }
            setloader(true)
            await GetApiCall('GET', '/get_signUpReward', { authentication: token }).then((res) => {
                if (res.status === 200 && res.data.status === 'SUCCESS') {
                    const editdata = res.data.data
                    data.earningtitle = editdata.title
                    data.earningvalue = editdata.earning_value
                    data.status = editdata.reward_status
                    setInitialvalue(data)
                }else{
                    setSaveActiveToastMessage(res?.data?.message);
                    toggleActive();
                }
            })
        }
        setloader(false)
    }
    useEffect(() => {
        if (token) {
            Getsignup()
        }
    }, [token])
    const deletemodal = () => {
        setshowdeletemodel(true)
    }
    const Deleteorder = async () => {
        setDeletespinner(true)
        await ApiCall('DELETE', '/delete_signup_reward', { id: Number(signup_id) }, { authentication: token }).then((res) => {
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
   
    let earnPointsBreadcrumb = {};
    if (process.env?.MODE !== 'local') {
        earnPointsBreadcrumb = AppButton.create(BridgeApp, { label: 'Earn points' });
        earnPointsBreadcrumb.subscribe(AppButton.Action.CLICK, () => {
            BridgeApp.dispatch(Redirect.toApp({ path: '/earnpoints' }));
        });
    }

    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                <TitleBar title='Signup' breadcrumbs={earnPointsBreadcrumb} />
            </Provider> : <></>}
            <div className="signup">
                {!loader ?
                    <Page backAction={{ content: 'Earnpoints', onAction: () => navigate('/earnpoints') }}
                        title="Signup"
                        primaryAction={<Button variant="primary" onClick={() => formik.handleSubmit()} loading={saveLoading} disabled={!formik.dirty}>{signup_id ? 'Save' : 'Create'}</Button>}>
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
                                        error={formik.touched.earningtitle && formik.errors.earningtitle}

                                    />
                                </Card>
                                <div className="pt-3">
                                    <Card title="Earning value">
                                        <div className="earningvalue">
                                            <div className='title'>
                                                Earning value
                                            </div>
                                            <TextField
                                                label="Points awarderd"
                                                type="number"
                                                value={formik.values.earningvalue}
                                                min={0}
                                                placeholder='e.g. 100'
                                                onChange={(value) => formik.setFieldValue('earningvalue', value)}
                                                autoComplete="off"
                                                suffix='point'
                                                onBlur={() => formik.setFieldTouched('earningvalue')}
                                                error={formik.touched && formik.touched.earningvalue && formik.errors.earningvalue}
                                            />
                                        </div>
                                    </Card>
                                </div>
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
                                                This what your customer will see in  UI. <Button variant='plain'>Learn more</Button> about actions
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
                        <div className={signup_id ? "Polaris-ButtonGroup justify-content-between mt-4" : "Polaris-ButtonGroup justify-content-end mt-4"}>
                            {signup_id ? <Button variant="primary" tone="critical" onClick={() => deletemodal()}>Delete</Button> : ''}
                            <Button variant="primary" loading={saveLoading} onClick={() => formik.handleSubmit()} disabled={!formik.dirty}>{signup_id ? 'Save' : "Create"}</Button>
                        </div>
                    </Page> : <div className="page_loader" key="loader">
                        <Spinner size="large" />
                    </div>}
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
                        <Text>Are you sure, you want to delete </Text>
                    </Modal.Section>
                </Modal>
            </div>

        </>
    )
}

export default Signup
