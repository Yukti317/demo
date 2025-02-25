import { Provider, TitleBar } from '@shopify/app-bridge-react'
import { BlockStack, Button, Card, Divider, Grid, Layout, Modal, Page, ResourceItem, ResourceList, Spinner, Text, Thumbnail } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import { config_variable } from '../../helper/commonApi'
import { useNavigate } from 'react-router-dom';
import { ApiCall, GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';

function Earnpoints() {
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const [active, setActive] = useState(false);
    const [earnpoints, setEarnpoints] = useState([])
    const [loader, setloader] = useState(false);
    const navigate = useNavigate();
    const toggleModal = useCallback(() => {
        setActive((active) => !active)
    }, []);

    const GetEarnpointslist = async () => {
        setloader(true)
        await GetApiCall('GET', '/earn_reward_listing', { authentication: token }).then((res) => {
            if (res.status === 200 && res.data.status === 'SUCCESS') {
                setEarnpoints(res.data.data)
            }
        })
        setloader(false)
    }

    useEffect(() => {
        if (token) {
            GetEarnpointslist()
        }

    }, [token])

    let item = [
        {
            id: '1',
            avatarSource: "https://cdn.sweettooth.io/v1/images/earning/order-online.svg?color=%236568FE",
            name: 'Place an order',

        },
        {
            id: '2',
            avatarSource: 'https://cdn.sweettooth.io/v1/images/earning/signup.svg?color=%236568FE',
            name: 'Sign up',
        }
    ]

    let title = ''
    let result = ''
    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') && <Provider config={config_variable.config}>
                <TitleBar title='Earn points' />
            </Provider>}

            <div className="Earnpoints">
                <Page>
                    <Layout>
                        <Layout.Section variant="oneThird">
                            <div style={{ marginTop: 'var(--p-space-500)' }}>
                                <h6 className='polaris-header-title'>
                                    Earn points
                                </h6>
                                <Text tone="subdued" variant='bodyLg' as="p">
                                    Create ways your customers can earn points when they join, share, and engage with your brand. Learn more about how customers earn points.
                                </Text>
                                <div className='py-2'>
                                    <Button onClick={toggleModal} size='large'>Add ways to earn</Button>
                                </div>
                            </div>
                        </Layout.Section>

                        <Layout.Section>
                            <Card>
                                <div className='card-polaris-title'>
                                    <h6 className="Polaris-Text--root Polaris-Text--headingMd px-4"> WAYS TO EARN</h6>

                                </div>
                                {!loader ? <>
                                    {earnpoints && earnpoints.length ? <div className="section2">
                                        <div className={`card-polaris-body ${earnpoints.length > 6 && 'boxoverflow'}`}>
                                            {earnpoints && earnpoints.length && earnpoints.map((data, index) => {
                                                title = data.title
                                                result = title.substring(0, 20)
                                                return (
                                                    <div className={earnpoints.length > 1 ? 'py-3 px-4 border-top' : 'py-3 px-4'} key={index}>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 5, sm: 3, md: 5, lg: 10, xl: 10 }}>

                                                                <div className='d-flex'>
                                                                    <div className="thumbnail">
                                                                        <Thumbnail
                                                                            source={data.point_type === '1' ? 'https://cdn.sweettooth.io/v1/images/earning/order-online.svg?color=%236568FE' : 'https://cdn.sweettooth.io/v1/images/earning/signup.svg?color=%236568FE'}
                                                                            alt=""
                                                                            size='small'
                                                                        />
                                                                    </div>
                                                                    <div className="content ps-4">

                                                                        <div className='listitems'>

                                                                            <div className='item'>
                                                                                <Text variant="bodyMd" as="h3">
                                                                                    {title.length > 20 ? result + '...' : result}  <span>{data.point_type === '1' ? '(Place an order)' : '(Sign Up)'}</span>
                                                                                </Text>
                                                                                <div>{data.earning_value}</div>

                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 1, lg: 2, xl: 2 }}>

                                                                <div className='editbtn'><Button variant='plain' onClick={() => { data.point_type === '1' ? navigate(`/earnpoints/placeorder/${data.id}`) : navigate(`/earnpoints/signup/${data.id}`) }}>Edit</Button></div>

                                                            </Grid.Cell>
                                                        </Grid>
                                                    </div>
                                                )

                                            })}


                                        </div>
                                    </div> : <div className='card-polaris-body'>
                                        <div className="py-3 px-4">
                                            <Grid>
                                                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 8, xl: 8 }}>

                                                    <Text variant='headingMd'>Add ways customers can earn points</Text>

                                                </Grid.Cell>
                                                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4, xl: 4 }}>

                                                    <div className='earnbtn px-3'>
                                                        <Button variant='primary' onClick={toggleModal}>Add ways to earn</Button>
                                                    </div>

                                                </Grid.Cell>
                                            </Grid>
                                        </div>

                                    </div>}</> : <div className="d-flex p-4 justify-content-center" key="loader">
                                    <Spinner size="large" />
                                </div>}
                                <Divider borderColor='border-inverse' />
                                <div className='pe-4 pt-3 pb-2 '>
                                    <BlockStack inlineAlign="end">
                                        <Button variant="plain" onClick={() => navigate('/earnpoints/viewallpoints')}>View all ways to earn</Button>
                                    </BlockStack>
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>
                </Page>
            </div>
            <Modal
                open={active}
                onClose={toggleModal}
                title="Ways to earns"
                secondaryActions={{
                    content: 'Cancel',
                    onAction: toggleModal,
                }}
            >
                <Modal.Section>

                    <div className="modaldata">
                        <div className="title">
                            <Text fontWeight='bold' as='h6'>Online Store</Text>
                        </div>

                        <ResourceList
                            resourceName={{ singular: 'customer', plural: 'customers' }}
                            items={item}
                            renderItem={(item, index) => {
                                const { id, avatarSource, name } = item;
                                return (
                                    <div style={{ pointerEvents: earnpoints.filter((item) => item.point_type === '2').length && index === '2' ? 'none' : '', opacity: earnpoints.filter((item) => item.point_type === '2').length && index === '2' ? '0.50' : '', borderTop: index === '2' && '1px solid #dee2e6' }}>
                                        <ResourceItem
                                            id={id}
                                            media={
                                                <Thumbnail
                                                    source={avatarSource}
                                                    size='small'
                                                    alt=""
                                                />
                                            }
                                            onClick={() => item?.id === '1' ? navigate('/earnpoints/placeorder') : navigate('/earnpoints/signup')}
                                            accessibilityLabel={`View details for ${name}`}
                                            name={name}

                                        >
                                            <Text variant="bodyMd" fontWeight='bold' as="h2">
                                                {name}
                                            </Text>

                                        </ResourceItem>

                                    </div>

                                );
                            }}
                        />
                    </div>

                </Modal.Section>
            </Modal>

        </>
    )
}

export default Earnpoints
