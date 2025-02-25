/* eslint-disable no-undef */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import timerIcon from '../assets/img/timer-icon.svg'
import clipIcon from '../assets/img/copyClipBoard.png'
import { ApiCall, GetApiCall } from '../helper/axios';
import moment from 'moment';
import { getCookie, setCookie } from '../helper/commonFunction';
import { config_variable } from '../helper/commonApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Spinner, Modal, Tooltip } from '@shopify/polaris';

const FrontVoucherList = () => {
    const notify = (message) => {
        const id = toast.success(message, {
            position: "bottom-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 1,
            theme: "dark",
        })
        setTimeout(() => {
            toast.dismiss(id)
        }, 2000);
    };
    const [descActive, setDescActive] = useState(false);
    const [descModalContent, setDescModalContent] = useState(['', '']);
    const descriptionRef = useRef(null);
    const [isShowMore, setIsShowMore] = useState(true);
    const [voucherList, setVouchersList] = useState([]);
    const [inCardVoucherList, setInCardVoucherList] = useState([]);
    const [inCardCompleteVoucherList, setInCardCompleteVoucherList] = useState([]);
    const [inCardExpireVoucherList, setInCardExpireVoucherList] = useState([]);
    const [loader, setLoader] = useState(false)
    const [webvoucherloader, setWebvoucherLoader] = useState(false)
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setloading] = useState([false])
    const generateToken = async () => {
        const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const { token } = res?.data?.data;
            const expirationHours = 24;
            setCookie("access_token", token, expirationHours);
            getVouchersList(token);
            getMyVouchers(token);
        }
    }

    const toggleModal = useCallback(() => setDescActive((descActive) => !descActive), []);

    const getVouchersList = async (token) => {
        setWebvoucherLoader(true)
        const res = await GetApiCall('GET', '/get_web_all_voucher', { authentication: token }, '1');
        if (res.data.status === 'SUCCESS' && res.status === 200) {
            const vouchers = res.data.data;
            setVouchersList(vouchers);
        }
        setWebvoucherLoader(false)
    }

    const getMyVouchers = async (token) => {
        setLoader(true)
        // eslint-disable-next-line no-undef
        if (window?.__st?.cid && customer_card_number) {
            const data = {
                customerId: window?.__st?.cid,
                // eslint-disable-next-line no-undef
                cardNo: customer_card_number
            }
            const res = await ApiCall('POST', '/get_my_voucher_List', data, { authentication: token }, '1');
            if (res.data.status === 'SUCCESS' && res.status === 200) {
                const detailData = res.data.data.voucher;
                const vouchercomplete = res.data.data.voucher_complete
                const expirevoucher = res.data.data.voucher_expired
                const vouchercount = res.data.data.count
                setCookie("vouchercount", vouchercount, 0)
                setInCardVoucherList(detailData);
                setInCardCompleteVoucherList(vouchercomplete)
                setInCardExpireVoucherList(expirevoucher)
            }
        }
        setLoader(false)
    }

    useEffect(() => {
        if (getCookie('access_token')) {
            getVouchersList(getCookie('access_token'));
            getMyVouchers(getCookie('access_token'));
        } else {
            generateToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (document.querySelector('.halo-banner-wrapper.slideshow .banner-item')) {
            const tempDiv = document.createElement("div");
            tempDiv.className = 'voucher-title';
            tempDiv.innerText = 'Vouchers & Offers';
            document.querySelector('.halo-banner-wrapper.slideshow .banner-item').appendChild(tempDiv);
        }

    }, []);

    const shopNowButton = async (voucherCode, index, flag) => {
        if (!flag) {
            setloading((ids) => ({
                ...ids,
                [index]: true
            }));
            await fetch(`/discount/${voucherCode}`).then((res) => {
                return res.text();
            }).then(async (res) => {
                setCookie('rewardVoucherCode', voucherCode, 0)
                window.open(window.location.origin);
                setloading((ids) => ({
                    ...ids,
                    [index]: false
                }));
            }).catch(() => {
                notify('Failed to apply voucher code!');
            })
        }
    }

    async function copyClipBoard(voucherCode) {
        // Get the text field
        var copyText = voucherCode;
        try {
            await navigator.clipboard.writeText(copyText);
            notify('Code copied to clipboard!');
        } catch (err) {
            notify('Failed to copy!');
        }
    }

    const manageDiscription = (e, title, description, isActiveVoucher, voucher_name, index) => {
        e.preventDefault();
        setDescModalContent([title, description, voucher_name, index]);
        if (isActiveVoucher) {
            shopNowButton(voucher_name, index, true)
        }
        toggleModal();
    }


    return (
        <>
            <style>
                {`.Polaris-Modal-Dialog__Modal{bottom: 30%;max-height: 100%;}`}
            </style>
            <Tabs defaultIndex={tabIndex} onSelect={(index) => setTabIndex(index)} className='voucher-list-tabs'>
                <div className="tabs-container">
                    <div className="container">
                        <TabList>
                            <Tab>Website vouchers</Tab>
                            {window?.__st?.cid && customer_card_number ? <Tab>My Vouchers</Tab> : ''}
                        </TabList>
                    </div>
                </div>
                <div className='container my-4'>
                    <TabPanel className='voucher-list-card-container'>
                        {!webvoucherloader ?
                            <>   {voucherList && voucherList.length ? <div className='voucher-grid-container'>
                                {voucherList.map((items, index) => {
                                    const isActiveVoucher = new Date(items.expiry_date).getTime() >= new Date().getTime();
                                    return (
                                        <div className={!isActiveVoucher ? 'voucher-grid-expire-list-card' : 'voucher-grid-list-card'} key={index}>
                                            {!isActiveVoucher && <div class="ribbon-expire ribbon-top-right-expire"><span>Expired</span></div>}
                                            <div className='voucher-grid-card-img'>
                                                <img src={items.files} className='w-100' alt='voucher-img' />
                                                <div className='voucher-retail-badge'>
                                                    {items.tag ? JSON.parse(items.tag) ? Object.values(JSON.parse(items.tag)).length && Object.values(JSON.parse(items.tag)).map((data) => {
                                                        return (
                                                            <>
                                                                {isActiveVoucher && <div className='voucher-badge'>
                                                                    <p className='m-0 p-0'>{data}</p>
                                                                </div>}
                                                            </>

                                                        )
                                                    }) : <></> : <></>}
                                                </div>
                                            </div>
                                            <div className='vocuher-grid-card-content'>
                                                <div className='voucher-grid-card-timer mb-2'>
                                                    <div className='voucher-grid-timer-icon'>
                                                        <img src={timerIcon} alt='timer-icon' />
                                                    </div>
                                                    <div className='voucher-timer-timing'>
                                                        <p className='p-0 m-0'>Offer ends {items.expiry_date ?
                                                            moment(items.expiry_date).format('DD/MM/YY [at] h:mm:ss A') ?
                                                                moment(items.expiry_date).format('DD/MM/YY [at] h:mm:ss A') :
                                                                moment(new Date()).format('DD/MM/YY [at] h:mm:ss A') :
                                                            moment(new Date()).format('DD/MM/YY [at] h:mm:ss A')} PT</p>
                                                    </div>
                                                </div>
                                                <div className='voucher-card-desc mb-2'>
                                                    <p>{items.description}
                                                        <a class={`view-more ${items.description.length > 150 ? 'desc_show' : 'desc_hide'}`} onClick={(e) => manageDiscription(e, items.title, items.description, isActiveVoucher, items.voucher_name, index)}>...View More</a>
                                                    </p>
                                                </div>
                                                <div className='voucher-card-copy-input mb-2'>
                                                    <div className="d-flex justify-content-between align-items-center w-100" onClick={() => { isActiveVoucher && copyClipBoard(items.voucher_name) }}>
                                                        <Tooltip content={items.voucher_name}>
                                                            <p className='m-0 p-0 code-overflow-manage'>{items.voucher_name}</p>
                                                        </Tooltip>
                                                        <div className='voucher-clipboard-icon'>
                                                            <img src={clipIcon} className='clipboard-icon' alt='copy-clipBoard-img' />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='voucher-card-shop-now-btn'>
                                                    <button type='button' onClick={() => {
                                                        if (isActiveVoucher) {
                                                            shopNowButton(items.voucher_name, index)
                                                        }
                                                    }} className={`voucher-btn ${isActiveVoucher ? 'active' : ' voucher-deactive'}`}>{!loading[index] ? "Shop Now" : <div className='btnspinner'><Spinner size='small' /></div>}</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div> : <div className='no-record-for-vouchers'>No voucher data!</div>}</>
                            : <div className="d-flex justify-content-center pt-5" key="loader">
                                <Spinner size="large" />
                            </div>}
                    </TabPanel>
                    <TabPanel>
                        {!loader ? <>
                            {inCardVoucherList && inCardVoucherList.length ? <div className='voucher-grid-container'>
                                {inCardVoucherList.map((items, index) => {
                                    const isActiveVoucher = new Date(items.ExpiryDate).getTime() >= new Date().getTime();
                                    return (
                                        <div className='voucher-grid-list-card' key={index}>
                                            <div className='voucher-grid-card-img'>
                                                <img src={items.Image} className='w-100' alt='voucher-img' />
                                                <div className='voucher-retail-badge'>

                                                    {items?.RewardDesc2 && <div className='voucher-badge'>
                                                        <p className='m-0 p-0'>{items.RewardDesc2}</p>
                                                    </div>}


                                                </div>
                                            </div>
                                            <div className='vocuher-grid-card-content'>
                                                <div className='voucher-grid-card-timer mb-2'>
                                                    <div className='voucher-grid-timer-icon'>
                                                        <img src={timerIcon} alt='timer-icon' />
                                                    </div>
                                                    <div className='voucher-timer-timing'>
                                                        <p className='p-0 m-0'>Offer ends {items.ExpiryDate ?
                                                            moment(items.ExpiryDate).format('DD/MM/YY [at] h:mm:ss A') ?
                                                                moment(items.ExpiryDate).format('DD/MM/YY [at] h:mm:ss A') :
                                                                moment(new Date()).format('DD/MM/YY [at] h:mm:ss A') :
                                                            moment(new Date()).format('DD/MM/YY [at] h:mm:ss A')} PT</p>
                                                    </div>
                                                </div>
                                                <div className='voucher-card-desc mb-2'>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <p className='mb-0'>RM{items.Value}</p>
                                                        <p className='mb-0'>{items.ValidDate}</p>
                                                    </div>

                                                    <p>{items.RewardDesc1}
                                                        <a class={`view-more ${items.RewardDesc1.length > 150 ? 'desc_show' : 'desc_hide'}`} onClick={(e) => manageDiscription(e, items.RewardTitle, items.RewardDesc1, isActiveVoucher, items.VoucherNo, index)}>...View More</a>
                                                    </p>
                                                </div>
                                                <div className='voucher-card-copy-input mb-2'>
                                                    <div className="d-flex justify-content-between align-items-center w-100" onClick={() => copyClipBoard(items.VoucherNo)}>
                                                        <Tooltip content={items.VoucherNo}>
                                                            <p className='m-0 p-0 code-overflow-manage'>{items.VoucherNo}</p>
                                                        </Tooltip>
                                                        <div className='voucher-clipboard-icon'>
                                                            <img src={clipIcon} className='clipboard-icon' alt='copy-clipBoard-img' />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='voucher-card-shop-now-btn'>
                                                    <button type='button' onClick={() => {
                                                        if (isActiveVoucher) {
                                                            shopNowButton(items.VoucherNo, index)
                                                        }
                                                    }} className={`voucher-btn ${isActiveVoucher ? 'active' : ' voucher-deactive'}`}>{!loading[index] ? "Shop Now" : <div className='btnspinner'><Spinner size='small' /></div>}</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {inCardCompleteVoucherList.map((items, index) => {
                                    return (
                                        <>
                                            <div className='voucher-grid-expire-list-card' key={index}>
                                                <div class="ribbon ribbon-top-right"><span>Completed</span></div>
                                                <div className='voucher-grid-card-img'>
                                                    <img src={items.Image} className='w-100' alt='voucher-img' />
                                                    <div className='voucher-retail-badge'>
                                                        {items?.RewardDesc2 && <div className='voucher-badge'>
                                                            <p className='m-0 p-0'>{items.RewardDesc2}</p>
                                                        </div>}
                                                    </div>
                                                </div>
                                                <div className='vocuher-grid-card-content'>
                                                    <div className='voucher-grid-card-timer mb-2'>
                                                        <div className='voucher-grid-timer-icon'>
                                                            <img src={timerIcon} alt='timer-icon' />
                                                        </div>
                                                        <div className='voucher-timer-timing'>
                                                            <p className='p-0 m-0'>Offer ends {items.ExpiryDate ?
                                                                moment(items.ExpiryDate).format('DD/MM/YY [at] h:mm:ss A') ?
                                                                    moment(items.ExpiryDate).format('DD/MM/YY [at] h:mm:ss A') :
                                                                    moment(new Date()).format('DD/MM/YY [at] h:mm:ss A') :
                                                                moment(new Date()).format('DD/MM/YY [at] h:mm:ss A')} PT</p>
                                                        </div>
                                                    </div>
                                                    <div className='voucher-card-desc mb-2'>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <p className='mb-0'>RM{items.Value}</p>
                                                            <p className='mb-0'>{items.ValidDate}</p>
                                                        </div>

                                                        <p>{items.RewardDesc1}</p>
                                                    </div>
                                                    <div className='voucher-card-copy-input mb-2'>
                                                        <div className="d-flex justify-content-between align-items-center w-100">
                                                            <p className='m-0 p-0'>{items.VoucherNo}</p>
                                                            <div className='voucher-clipboard-icon'>
                                                                <img src={clipIcon} className='clipboard-icon' alt='copy-clipBoard-img' />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='voucher-card-shop-now-btn'>
                                                        <button type='button' className='voucher-btn  voucher-deactive'>{!loading[index] ? "Shop Now" : <div className='btnspinner'><Spinner size='small' /></div>}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>

                                    )
                                })}
                                {inCardExpireVoucherList.map((items, index) => {
                                    return (
                                        <div className='voucher-grid-expire-list-card' key={index}>
                                            <div class="ribbon-expire ribbon-top-right-expire"><span>Expired</span></div>
                                            <div className='voucher-grid-card-img'>
                                                <img src={items.Image} className='w-100' alt='voucher-img' />
                                                <div className='voucher-retail-badge'>
                                                    {items?.RewardDesc2 && <div className='voucher-badge'>
                                                        <p className='m-0 p-0'>{items.RewardDesc2}</p>
                                                    </div>}
                                                </div>
                                            </div>
                                            <div className='vocuher-grid-card-content'>
                                                <div className='voucher-grid-card-timer mb-2'>
                                                    <div className='voucher-grid-timer-icon'>
                                                        <img src={timerIcon} alt='timer-icon' />
                                                    </div>
                                                    <div className='voucher-timer-timing'>
                                                        <p className='p-0 m-0'>Offer ends {items.ExpiryDate ?
                                                            moment(items.ExpiryDate).format('DD/MM/YY [at] h:mm:ss A') ?
                                                                moment(items.ExpiryDate).format('DD/MM/YY [at] h:mm:ss A') :
                                                                moment(new Date()).format('DD/MM/YY [at] h:mm:ss A') :
                                                            moment(new Date()).format('DD/MM/YY [at] h:mm:ss A')} PT</p>
                                                    </div>
                                                </div>
                                                <div className='voucher-card-desc mb-2'>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <p className='mb-0'>RM{items.Value}</p>
                                                        <p className='mb-0'>{items.ValidDate}</p>
                                                    </div>

                                                    <p>{items.RewardDesc1}</p>
                                                </div>
                                                <div className='voucher-card-copy-input mb-2'>
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <p className='m-0 p-0'>{items.VoucherNo}</p>
                                                        <div className='voucher-clipboard-icon'>
                                                            <img src={clipIcon} className='clipboard-icon' alt='copy-clipBoard-img' />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='voucher-card-shop-now-btn'>
                                                    <button type='button' className='voucher-btn  voucher-deactive'>{!loading[index] ? "Shop Now" : <div className='btnspinner'><Spinner size='small' /></div>}</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div> : <div className='no-record-for-vouchers'>No voucher data!</div>}
                        </> : <div className="d-flex justify-content-center pt-5" key="loader">
                            <Spinner size="large" />
                        </div>}

                    </TabPanel>
                </div>
                <ToastContainer
                    position="bottom-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </Tabs>
            <Modal
                open={descActive}
                onClose={toggleModal}
                title={descModalContent[0]}
                size='small'
            >
                <Modal.Section>
                    <p className={`font-12 ${descModalContent[1].length > 500 ? 'modalscroll' : ''}`}>
                        {descModalContent[1]}
                    </p>
                    <div className='voucher-card-shop-now-btn margin-side'>
                        <button type='button' onClick={() => {
                            shopNowButton(descModalContent[2], descModalContent[3])
                        }} className={`voucher-btn ${true ? 'active' : ' voucher-deactive'}`}>{!loading[descModalContent[3]] ? "Shop Now" : <div className='btnspinner'><Spinner size='small' /></div>}</button>
                    </div>
                </Modal.Section >
            </Modal >
        </>
    )
}

export default FrontVoucherList