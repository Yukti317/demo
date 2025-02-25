import React, { useState, useCallback, useEffect } from 'react'
import { Page, Modal, ResourceList, ResourceItem, IndexTable, Badge, Thumbnail, Card, Avatar } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { GetApiCall } from '../../helper/axios';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { BridgeApp, config_variable } from '../../helper/commonApi';
import { Button as AppButton, Redirect } from '@shopify/app-bridge/actions';

const RewardsList = () => {
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const [activeRedeem, setActiveRedeem] = useState(false);
    const [rewardList, seRewardList] = useState([]);
    const [redeemWays, setRedeemWays] = useState([
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

    const fetchData = async () => {
        const res = await GetApiCall('GET', '/redeem_reward_listing', { authentication: token });
        if (res.data.status === 'SUCCESS' && res.status === 200) {
            const detailData = res.data.data;
            seRewardList(detailData);
        }

    }

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token])

    const orders = [
        {
            id: '1020',
            name: '#1020',
            type: 'Amount discount',
            points: '$969.44',
            status: <Badge progress="complete">Active</Badge>,
            source: 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg'
        },
        {
            id: '1019',
            name: '#1020',
            type: 'Amount discount',
            points: '$969.44',
            status: <Badge progress="complete">Active</Badge>,
            source: 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg'
        },
        {
            id: '1018',
            name: '#1020',
            type: 'Amount discount',
            points: '$969.44',
            status: <Badge progress="complete">Active</Badge>,
            source: 'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg'
        },
    ];

    const rowMarkup = rewardList.map(({ id, title, point_type, point_cost, reward_status, customer_redeem_increment, customer_gets, source }, index) => (
        <tr class="Polaris-IndexTable__TableRow Polaris-IndexTable__TableRow--unclickable" onClick={() => { redeemWays.filter((item) => item.id === point_type).length ? navigate(`${redeemWays.filter((item) => item.id === point_type)[0].url}/${id}`) : navigate('/redeem-points') }} key={index}>
            <IndexTable.Cell>
                <div className='productdata ps-2'>
                    <Thumbnail
                        source={ point_type === '1' ?'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg' :point_type === '2' ?'https://cdn.sweettooth.io/v1/images/rewards/fixed-amount.svg' :point_type === '3' ? 'https://cdn.sweettooth.io/v1/images/rewards/percentage-coupon.svg' : point_type === '4' ? 'https://cdn.sweettooth.io/v1/images/rewards/shipping.svg' : point_type === '5' ?'https://cdn.sweettooth.io/v1/images/rewards/free-product.svg' : ''}
                        alt="Black choker necklace"
                        size='small'
                    />
                    <div className='text-overflow-manage'>{title}</div>
                </div>
            </IndexTable.Cell>
            <IndexTable.Cell><Badge tone={reward_status === '1' ? "success" : 'critical'}>{reward_status === '1' ? 'Active' : 'Disabled'}</Badge></IndexTable.Cell>
            <IndexTable.Cell>{point_type === '1' ? 'Fixed Amount Discount'
                : point_type === '2' ? 'Incremental Amount Discount'
                    : point_type === '3' ? 'Percentage off'
                        : point_type === '4' ? 'Free Shipping'
                            : 'Free Product'}</IndexTable.Cell>
            <IndexTable.Cell>{point_type === '2' ? `${customer_redeem_increment} Ponits = $${customer_gets}` : `${point_cost} Points`}</IndexTable.Cell>
        </tr>
    ));

    const toggleModal = useCallback(() => setActiveRedeem((activeRedeem) => !activeRedeem), []);

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
                <TitleBar title='Rewards' breadcrumbs={redeemPointsBreadcrumb} />
            </Provider> : <></>}
            <Page title='Rewards' backAction={{ content: 'points', onAction: () => navigate('/redeem-points') }} primaryAction={{ primary: true, content: 'Add ways to redeem', onAction: toggleModal }}>
                <div className='viewallpoints'>
                    <Card>
                        <IndexTable
                            itemCount={rewardList.length}
                            selectable={false}
                            headings={[[]]}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </Card>
                </div>
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
        </>
    )
}

export default RewardsList