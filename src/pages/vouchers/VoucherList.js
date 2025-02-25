import { Button, Card, EmptySearchResult, IndexFilters, IndexTable, Page, EmptyState, Thumbnail, useIndexResourceState, useSetIndexFiltersMode, Spinner } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetApiCall } from '../../helper/axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Provider, TitleBar } from '@shopify/app-bridge-react';
import { config_variable } from '../../helper/commonApi';

const VoucherList = () => {
    const navigate = useNavigate();
    const store_data = useSelector((state) => state.commonData.store_data);
    const token = store_data?.token;
    const [loader, setloader] = useState(true);
    const [indexLoader, setIndexLoader] = useState(false);
    const [voucherlist, setVoucherlist] = useState([])
    const [selected, setSelected] = useState(0);

    const [itemStrings, setItemStrings] = useState([
        'Current',
        'Expire',
    ]);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,

    }));

    const sortOptions = [
        { label: 'VoucherName', value: 'name asc', directionLabel: 'A-Z' },
        { label: 'VoucherName', value: 'name desc', directionLabel: 'Z-A' },
        { label: 'Date', value: 'date asc', directionLabel: 'Ascending' },
        { label: 'Date', value: 'date desc', directionLabel: 'Descending' },
        { label: 'Status', value: 'status asc', directionLabel: 'Ascending' },
        { label: 'Status', value: 'status desc', directionLabel: 'Descending' },
    ];
    const [sortSelected, setSortSelected] = useState(['name asc']);
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { setQueryValue(''); Getvoucherlist(''); };

    const [queryValue, setQueryValue] = useState('');

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        if (value && value.length > 2) {
            Getvoucherlist(value)
        }
        if (value === '') {
            Getvoucherlist(value)
        }
    }

    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const filters = [];

    const appliedFilters = [];

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(voucherlist);

    const handleSortSelected = (value) => {
        setSortSelected(value);
        value && value[0] && Getvoucherlist(queryValue, value, true)
    }
    const handletabs = (value) => {
        setSelected(value)
        Getvoucherlist('','',value,true)
    }
    const Getvoucherlist = async (queryValue, sortSelectedValue,tabvalue=0, flag) => {
        sortSelectedValue = sortSelectedValue ? sortSelectedValue : sortSelected;
        if (queryValue || flag) {
            setIndexLoader(true)
        } else {
            setloader(true)
        }
        let url = '/get_all_voucher'
        let vnamevalue = ''
        let datevalue = ''
        let statusvalue = ''
        if (sortSelectedValue[0] === 'name desc' || sortSelectedValue[0] === 'name asc') {
            vnamevalue = `?key=voucherName&search=${queryValue}&sort=${sortSelectedValue[0] === 'name desc' ? '2' : '1'}&voucher_status=${tabvalue === 0 ? 'active' : 'expired'}`
            url += vnamevalue
        }
        if (sortSelectedValue[0] === 'date desc' || sortSelectedValue[0] === 'date asc') {
            datevalue = `?key=date&search=${queryValue}&sort=${sortSelectedValue[0] === 'date desc' ? '2' : '1'}&voucher_status=${tabvalue === 0 ? 'active' : 'expired'}`
            url += datevalue
        }
        if (sortSelectedValue[0] === 'status desc' || sortSelectedValue[0] === 'status asc') {
            statusvalue = `?key=status&search=${queryValue}&sort=${sortSelectedValue[0] === 'status desc' ? '2' : '1'}&voucher_status=${tabvalue === 0 ? 'active' : 'expired'}`
            url += statusvalue
        }

        await GetApiCall('GET', url, { authentication: token }).then((res) => {
            if (res.status === 200 && res.data.status === 'SUCCESS') {
                setVoucherlist(res.data.data)
            }
        })

        if (queryValue || flag ) {
            setIndexLoader(false)
        } else {
            setloader(false)
        }
    }

    useEffect(() => {
        if (token) {
            Getvoucherlist(queryValue)
        }
    }, [token])
    const rowMarkup = voucherlist && voucherlist.map(
        (
            data,
            index,
        ) => (
            <>
                <tr className='Polaris-IndexTable__TableRow Polaris-IndexTable__TableRow--unclickable' id={data.id}
                    key={data.id}
                    selected={selectedResources.includes(data.id)}
                    position={index}
                    onClick={() => navigate(`/voucher/add-voucher/${data.id}`)}
                >
                    <IndexTable.Cell>
                        <Thumbnail
                            source={data.files}
                            alt=""
                            size='small'
                        />
                    </IndexTable.Cell>
                    <IndexTable.Cell>{data.title} </IndexTable.Cell>
                    <IndexTable.Cell>{moment(data.expiry_date).format('MM/DD/YYYY h:mm A')}</IndexTable.Cell>
                    <IndexTable.Cell>{data.reward_status === '1' ? 'Active' : 'Deactive'}</IndexTable.Cell>
                </tr>
            </>

        ),
    );
    const allproductsemptyStateMarkup = (

        <EmptySearchResult
            title={'Voucher not found'}
            description={'Try changing the search term'}
            withIllustration
        />
    );
    const addvoucheremptystate = (
        <EmptyState
            heading={selected === 1 ? "No Record of expire voucher" : "Manage your vouchers"}
            action={!selected && { content: 'Add Voucher', onAction: () => navigate('/voucher/add-voucher') }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
        </EmptyState>
    )

    return (
        <>
            {process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                <TitleBar title='Voucher' />
            </Provider> : <></>}
            <div className="voucherlist">
                {!loader ?
                    <Page title="Voucher" primaryAction={<Button variant="primary" onClick={() => navigate('/voucher/add-voucher')}>Add Voucher</Button>}>
                        <Card>
                            <>
                                <IndexFilters
                                    sortOptions={sortOptions}
                                    sortSelected={sortSelected}
                                    queryValue={queryValue}
                                    queryPlaceholder="Search"
                                    onQueryChange={(value) => handleFiltersQueryChange(value)}
                                    onQueryClear={() => setQueryValue('')}
                                    onSort={(value) => handleSortSelected(value)}
                                    cancelAction={{
                                        onAction: onHandleCancel,
                                        disabled: false,
                                        loading: false,
                                    }}
                                    tabs={tabs}
                                    selected={selected}
                                    onSelect={(value)=> handletabs(value)}
                                    canCreateNewView={false}
                                    onCreateNewView={''}
                                    filters={filters}
                                    appliedFilters={appliedFilters}
                                    onClearAll={handleFiltersClearAll}
                                    mode={mode}
                                    setMode={setMode}
                                />

                                {!indexLoader ? <IndexTable
                                    resourceName={resourceName}
                                    itemCount={voucherlist.length}
                                    selectedItemsCount={
                                        allResourcesSelected ? 'All' : selectedResources.length
                                    }
                                    emptyState={queryValue ? allproductsemptyStateMarkup : addvoucheremptystate}
                                    onSelectionChange={handleSelectionChange}
                                    headings={[
                                        {},
                                        { title: 'Voucher Name' },
                                        { title: 'Expiry Date and Time' },
                                        { title: 'Status' },

                                    ]}
                                    selectable={false}
                                >
                                    {rowMarkup}
                                </IndexTable> : <div className="index-table-loader" key="loader">
                                    <Spinner size="large" />
                                </div>}
                            </>

                        </Card>
                    </Page> : <div className="page_loader" key="loader">
                        <Spinner size="large" />
                    </div>}
            </div>
        </>
    )
}

export default VoucherList