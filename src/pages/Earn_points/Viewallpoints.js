import { Button, Page, ResourceItem, ResourceList, Text, Thumbnail, Modal, Card, Badge, IndexTable, EmptySearchResult, Spinner } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

function Viewallpoints() {
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const [active, setActive] = useState(false);
    const [earnpoints, setEarnpoints] = useState([])
    const [loader, setloader] = useState(false);
    const toggleModal = useCallback(() => {
        setActive((active) => !active)
    }, []);
    const navigate = useNavigate();


    const GetEarnpointslist = async () => {
        setloader(true)
        await GetApiCall('GET', '/earn_reward_listing', { authentication: token }).then((res) => { setEarnpoints(res.data.data) })
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
    const rows = earnpoints.map((data, i) => [
        <tr className='Polaris-IndexTable__TableRow Polaris-IndexTable__TableRow--unclickable' onClick={() => { data.point_type === '1' ? navigate(`/earnpoints/placeorder/${data.id}`) : navigate(`/earnpoints/signup/${data.id}`) }}>
            <IndexTable.Cell>
                <div className='productdata' >
                    <Thumbnail
                        size='small'
                        source={data.point_type === '1' ? "https://cdn.sweettooth.io/v1/images/earning/order-online.svg?color=%236568FE" : 'https://cdn.sweettooth.io/v1/images/earning/signup.svg?color=%236568FE'}
                        alt=""
                    />
                    <p className='mb-0'>{data.title}</p>
                </div>
            </IndexTable.Cell>
            <IndexTable.Cell> <Badge tone={data.reward_status === '1' ? "success" : "attention"}>{data.reward_status === '1' ? "Active" : "Deactive"}</Badge></IndexTable.Cell>
            <IndexTable.Cell><div >{data.point_type === '1' ? 'Place an order' : 'Sign Up'}</div></IndexTable.Cell>
            <IndexTable.Cell>{`${data.earning_value} Points for every ₹1 spent`}</IndexTable.Cell>
        </tr>

    ]);
    const allproductsemptyStateMarkup = (
        <EmptySearchResult
            title={'No action found'}
            description={'Add an action so your customers can start earning points.'}
            withIllustration
        />
    );

    let earnPointsBreadcrumb = {};
    if (process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my')) {
        earnPointsBreadcrumb = AppButton.create(BridgeApp, { label: 'Earn points' });
        earnPointsBreadcrumb.subscribe(AppButton.Action.CLICK, () => {
            BridgeApp.dispatch(Redirect.toApp({ path: '/earnpoints' }));
        });
    }

    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                <TitleBar title='Actions' breadcrumbs={earnPointsBreadcrumb} />
            </Provider> : <></>}
            <Page backAction={{ content: 'Earnpoints', onAction: () => navigate('/earnpoints') }}
                title="Actions"
                primaryAction={<Button variant='primary' onClick={toggleModal}>Add ways to earn</Button>}>
                <div className="viewallpoints">
                    <Card>
                        {!loader ?
                            <IndexTable
                                itemCount={earnpoints.length}
                                headings={[[]]}
                                selectable={false}
                                emptyState={allproductsemptyStateMarkup}
                            >
                                {rows}
                            </IndexTable> : <div className="d-flex p-4 justify-content-center" key="loader">
                                <Spinner size="large" />
                            </div>}
                    </Card>

                </div>
            </Page>
            <Modal
                open={active}
                onClose={toggleModal}
                title="Ways to earns"
                primaryAction={{
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
                                    <div style={{ pointerEvents: earnpoints.filter((item) => item.point_type === '2').length && index === '2' ? 'none' : '', opacity: earnpoints.filter((item) => item.point_type === '2').length && index === '2' ? '0.70' : '', borderTop: index === '2' && '1px solid #dee2e6' }}>
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

export default Viewallpoints
