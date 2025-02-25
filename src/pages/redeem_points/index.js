import React, { useState, useCallback, useEffect } from 'react'
import { Page, Layout, Card, Text, Button, Grid, Modal, BlockStack, ResourceList, ResourceItem, Thumbnail, Spinner, Avatar, Divider } from '@shopify/polaris'
import { useNavigate } from 'react-router-dom';
import { GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import { config_variable } from '../../helper/commonApi';
import { Provider, TitleBar } from '@shopify/app-bridge-react';

const RedeemPoints = () => {
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const [activeRedeem, setActiveRedeem] = useState(false);
    const [isDisabledWays] = useState(false);
    const [redeemData, setRedeemData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeemWays] = useState([
        {
            id: '1',
            url: '/redeem-points/fixed-amount-discount',
            name: 'Fixed Amount Discount',
            source: 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg'
        },
        {
            id: '2',
            url: '/redeem-points/increment-amount-discount',
            name: 'Incremental Amount Discount',
            source: 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg'
        },
        {
            id: '3',
            url: '/redeem-points/percentage-off',
            name: 'Percentage Off',
            source: 'https://cdn.sweettooth.io/v1/images/rewards/percentage-coupon.svg'
        },
        {
            id: '4',
            url: '/redeem-points/free-shipping',
            name: 'Free Shipping',
            source: 'https://cdn.sweettooth.io/v1/images/rewards/shipping.svg'
        },
        {
            id: '5',
            url: '/redeem-points/free-product',
            name: 'Free Product',
            source: 'https://cdn.sweettooth.io/v1/images/rewards/free-product.svg'
        },
    ]);

    const toggleModal = useCallback(() => setActiveRedeem((activeRedeem) => !activeRedeem), []);

    const fetchData = async () => {
        const res = await GetApiCall('GET', `/redeem_reward_listing`, { authentication: token });
        if (res.data.status === "SUCCESS" && res.status === 200) {
            const data = res.data.data;
            setRedeemData(data);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                <TitleBar title='Redeem points' />
            </Provider> : <></>}
            <div className='redeempoints'>
                <Page>
                    <Layout>
                        <Layout.Section variant="oneThird">
                            <div style={{ marginTop: 'var(--p-space-300)' }}>
                                <h6 className='polaris-header-title'>
                                    Redeem points
                                </h6>
                                <Text tone="subdued" variant='bodyLg' as="p">
                                    Create rewards your customers can redeem with the points they’ve earned. Learn more about how customers redeem points.
                                </Text>
                                <div className='py-2'>
                                    <Button onClick={toggleModal} disabled={isDisabledWays} size='large'>Add ways to redeem</Button>
                                </div>
                            </div>
                        </Layout.Section>
                        <Layout.Section>
                            <Card>
                                <div className='card-polaris-title'>
                                    <Text variant='bodyLg' fontWeight='semibold'>
                                        WAYS TO REDEEM
                                    </Text>
                                </div>
                                {!loading ? <>
                                    {redeemData && redeemData.length ? <div className={`redeem-points-table ${redeemData.length > 6 && 'boxoverflow'}`}>
                                        <div className=''>
                                            {redeemData.map((data, index) => {
                                                return (
                                                    <div className={`px-3 ${redeemData.length > 1 && index !== 0 ? 'redeem-points-items' : 'py-3'}`} key={index}>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 5, sm: 3, md: 5, lg: 10, xl: 10 }}>
                                                                <div className='d-flex'>
                                                                    <div className="thumbnail">
                                                                        <Thumbnail
                                                                            source={data.point_type === '1' ? 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg' : data.point_type === '2' ? 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg' : data.point_type === '3' ? 'https://cdn.sweettooth.io/v1/images/rewards/percentage-coupon.svg' : data.point_type === '4' ? 'https://cdn.sweettooth.io/v1/images/rewards/shipping.svg' : data.point_type === '5' ? 'https://cdn.sweettooth.io/v1/images/rewards/free-product.svg' : ''}
                                                                            alt=""
                                                                            size='small'
                                                                        />
                                                                    </div>
                                                                    <div className="content ps-4">
                                                                        <div className='listitems'>
                                                                            <div className='item'>
                                                                                <Text variant="bodyMd" as="h3">
                                                                                    <div className='text-overflow-manage' style={{ width: '300px' }}>
                                                                                        {data.title}
                                                                                    </div>
                                                                                </Text>
                                                                                <Text variant="bodyMd" as="p">
                                                                                    {data.point_type === '2' ? `${data.customer_redeem_increment} Points = RM${data.customer_gets}` : `${data.point_cost} Points`}
                                                                                </Text>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 1, lg: 2, xl: 2 }}>
                                                                <div className='editbtn'><Button variant='plain' onClick={() => {
                                                                    data.point_type === '1' ? navigate(`/redeem-points/fixed-amount-discount/${data.id}`)
                                                                        : data.point_type === '2' ? navigate(`/redeem-points/increment-amount-discount/${data.id}`)
                                                                            : data.point_type === '3' ? navigate(`/redeem-points/percentage-off/${data.id}`)
                                                                                : data.point_type === '4' ? navigate(`/redeem-points/free-shipping/${data.id}`)
                                                                                    : navigate(`/redeem-points/free-product/${data.id}`)
                                                                }}>Edit</Button></div>
                                                            </Grid.Cell>
                                                        </Grid>
                                                    </div>
                                                )

                                            })}
                                        </div>
                                    </div> : <>
                                        <div className='card-polaris-body'>
                                            <div className='py-3'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 8, xl: 8 }}>
                                                        <div className='div-align-center'>
                                                            <Text variant='headingMd'>
                                                                Add ways customers can spend their points on a reward
                                                            </Text>
                                                        </div>
                                                    </Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
                                                        <div className='px-3'>
                                                            <Button variant="primary" size="large" onClick={toggleModal}>Add ways to Redeem</Button>
                                                        </div>
                                                    </Grid.Cell>
                                                </Grid>
                                            </div>
                                        </div>
                                    </>}
                                </> : <div className='d-flex justify-content-center'><Spinner accessibilityLabel="Spinner example" size="large" /></div>}
                                <div className='redeem-points-table'>
                                    {(redeemData && redeemData.length) ? <Divider borderColor='border-inverse' /> : <></>}
                                    <div className='all-ways'>
                                        <BlockStack inlineAlign="end">
                                            <Button variant="plain" onClick={() => navigate('/reward-list')} >View all ways to redeem</Button>
                                        </BlockStack>
                                    </div>
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>
                    <Modal
                        open={activeRedeem}
                        onClose={toggleModal}
                        title="Ways to redeem"
                        secondaryActions={{
                            content: 'Cancel',
                            onAction: toggleModal,
                        }}
                    >
                        <Modal.Section>
                            <div className="Polaris-Card__Section card-section-title">
                                <div className="Polaris-Card__SectionHeader ">
                                    <h6 className='polaris-header-title px-2'>
                                        Online Store
                                    </h6>
                                </div>
                            </div>
                            <ResourceList
                                resourceName={{ singular: 'customer', plural: 'customers' }}
                                items={redeemWays}
                                renderItem={(item) => {
                                    const { id, url, name, source } = item;
                                    const media = <Avatar source={source} size="md" name={name} />;

                                    return (
                                        <ResourceItem
                                            id={id}
                                            onClick={() => navigate(url)}
                                            media={media}
                                            accessibilityLabel={`View details for ${name}`}
                                        >
                                            <div>{name}</div>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        </Modal.Section>
                    </Modal>
                </Page>
            </div>

        </>
    )
}

export default RedeemPoints