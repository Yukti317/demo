/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from 'react'
import Fab from '@mui/material/Fab';
import CloseIcon from '@mui/icons-material/Close';
import aapharmacyCard from '../../assets/img/aapaharacy_card_1.png'
import rewardCoin from '../../assets/img/reward-coin.png'
import yourRewardCoin from '../../assets/img/your-reward.png'
import redeem from '../../assets/img/redeem.png'
import vouchers from '../../assets/img/vouchers.png'
import vipIcon from '../../assets/img/vip.png'
import HowToEarnWidget from './HowToEarnWidget';
import WaysToRedeemWidget from './WaysToRedeemWidget';
import YourRewardWidget from './YourRewardWidget';
import Termswidget from './Termswidget';
import { config_variable } from '../../helper/commonApi';
import { ApiCall, GetApiCall } from '../../helper/axios';
import { getCookie, setCookie } from '../../helper/commonFunction';
import { SkeletonBodyText } from '@shopify/polaris';

const RewardWidget = () => {
  const [popupclose, setPoppClose] = useState(false)
  const popupRef = useRef(null);
  const [earnshow, setEarnShow] = useState(false);
  const [redeemshow, setRedeemShow] = useState(false);
  const [yourrewardshow, setYourrewarShow] = useState(false);
  const [termsshow, setTermsShow] = useState(false);
  const [loader, setLoader] = useState(false)
  const [rewardvoucherlist, setRewardvouhcerlist] = useState([])
  const vipMemberPopup = () => {
    if (popupclose === false) {
      setPoppClose(true)
      setEarnShow(false)
      setRedeemShow(false)
      setYourrewarShow(false)
      setTermsShow(false)
    } else {
      setPoppClose(false)
    }
  }
  const generateToken = async () => {
    const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
    if (res.data.status === 'success' && res.data.statusCode === 200) {
      const { token } = res?.data?.data;
      const expirationHours = 24;
      setCookie("access_token", token, expirationHours);
      getredeemvoucherlist(token)
    }
  }

  const getredeemvoucherlist = async (token) => {
    // eslint-disable-next-line no-undef
    const res = await GetApiCall('GET', '/get_redeem_voucher_code_list', { authentication: token }, '1')
    if (res.data.status === 'SUCCESS' && res.status === 200) {
      setRewardvouhcerlist(res.data.data)
    }
  }
  useEffect(() => {
    if (getCookie('access_token')) {
      getredeemvoucherlist(getCookie('access_token'))
    } else {
      generateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleshowearnwidget = () => {
    setEarnShow(true)
    if (document.querySelector(".aapharamcy-membership-container.home-page")) {
      document.querySelector(".aapharamcy-membership-container.home-page").style.display = "none"
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.widget-page #howtoearn").style.display = "block"
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
  }
  const handleshowredeemwidget = () => {
    setRedeemShow(true)
    setYourrewarShow(false)
    if (document.querySelector(".aapharamcy-membership-container.home-page")) {
      document.querySelector(".aapharamcy-membership-container.home-page").style.display = "none"
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.widget-page #howtoredeem").style.display = "block"
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
  }
  const handleyourrewards = () => {
    setYourrewarShow(true)
    setRedeemShow(false)
    if (document.querySelector(".aapharamcy-membership-container.home-page")) {
      document.querySelector(".aapharamcy-membership-container.home-page").style.display = "none"
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.widget-page #yourreward").style.display = "block"
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
  }
  const handleterms = () => {
    // setTermsShow(true)
    // if (document.querySelector(".aapharamcy-membership-container.home-page")) {
    //   document.querySelector(".aapharamcy-membership-container.home-page").style.display = "none"
    //   document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
    //   document.querySelector(".aapharamcy-membership-container.widget-page #terms").style.display = "block"
    //   document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    // }
    window.open("https://aapharmacy.com.my/pages/membership-tnc")
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPoppClose(false);
        document.querySelector('.voucher-floating-icon-container').classList.remove('voucher-floating-icon-custom-height');
      }
    };
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [popupRef]);
  const sfariclass = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
  const isEdge = /Edg/.test(navigator.userAgent);
 
  return (
    <>
      <div className={`voucher-floating-icon-container ${(earnshow || redeemshow || yourrewardshow || termsshow) ? 'voucher-floating-icon-custom-height' : ''}`}>
        <div className="floating-icon" onClick={vipMemberPopup}>
          <Fab color="primary" size='medium' aria-label="add" variant='circular' className={`floating-fabicon ${popupclose === true ? 'bg-cross-icon ' : ''}`}>
            {popupclose === false ? <img src={vipIcon} alt='vipicon' className='w-100' /> : <CloseIcon className='floating-icon-inner' />}
          </Fab>
        </div>
        {popupclose === true ? <>
          <div ref={popupRef}>
            <div className={`aapharamcy-membership-container ${!(window?.__st?.cid && customer_card_number) ? 'aapharmcay-logout-member-card' : ''}  home-page ${(sfariclass || isEdge) ? 'aapharamcy-safari-web-page' : ''}`} id='popup' style={{ display: !(earnshow || redeemshow || yourrewardshow || termsshow) ? "block" : "none" }}>
              <div className='aapharamcy-card'>
                <div id='rewardwidget'>
                  <div className='aapharamcy-card-sec'>
                    <img src={aapharmacyCard} alt='aapharmacycard' className='w-100' />
                  </div>
                  <div className='aapharamcy-member-card-container'>
                    {!(window?.__st?.cid && customer_card_number) ?
                      <div className="aapharamcy-member-card">
                        <h3 className='m-0 mb-1'>Become a Member!</h3>
                        <p className='p-0 m-0 mb-2'>Unlock Exclusive Rewards! Join the AA Pharmacy Membership Today and Earn Points with Every Purchase</p>
                        <a className='aapharamcy-join-btn mb-2 text-light' href='https://aapharmacy.com.my/account/register'>Join Now button</a>

                        <div className='aapharamcy-member-signin mt-3'>
                          <p className='p-0 m-0'>Already have an account? <a href="https://aapharmacy.com.my/account/login" className='signin-aapharamcy'>Sign In</a></p>
                        </div>
                      </div>
                      :
                      <div className='aapaharamcy-member-reward-container'>
                        <div className="aapharamcy-member-card aapharamcy-sign-in-mem-card mb-2">
                          {!loader ? <>
                            <h3 className='m-0 mb-1'>{customer_card_number}</h3>
                            <div className='aapharamcy-member-signin current-balance'>
                              <p className='p-0 m-0'>You currently have <img src={rewardCoin} className='d-inline' alt='rewardcoin' /> <b>{getCookie('balance') ? getCookie('balance') : 0}</b> AA VIP Membership</p>
                            </div>
                          </> : <SkeletonBodyText lines={2} />}
                        </div>
                        <div className="aapharamcy-member-card aapharamcy-sign-in-mem-card"  >
                          <a className='aapharamcy-reward-container d-flex align-items-center justify-content-between text-decoration-none' onClick={() => handleyourrewards()}>
                            <div className='d-flex align-items-center gap-2'>
                              <div className='aapharamcy-reward-icon'>
                                <img src={yourRewardCoin} className='d-inline' />
                              </div>
                              <div className='aapharamcy-reward-content text-start '>
                                <h3 className='m-0 mb-1'>Your Rewards</h3>
                                <p className='p-0 m-0'>You have <b>{rewardvoucherlist.length}</b> rewards available</p>
                              </div>
                            </div>
                            <div className='aapharamcy-member-signin'>
                              <p className='p-0 m-0'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
                                  <path d="M1 9L5 5L1 1" stroke="#BEB2AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                              </p>
                            </div>
                          </a>
                        </div>

                      </div>
                    }
                    <div className='aapaharamcy-vip-member-container mt-2'>
                      <div className="aapharamcy-member-card">
                        <h3 className='m-0 mb-1'>AA VIP Membership</h3>
                        <p className='p-0 m-0 mb-2'>Earn AA VIP Points for different actions, and turn those AA VIP Points into awesome rewards!</p>
                        <div className='aapharamcy-member-signin'>
                          <div className='aapharamcy-member-list-vip'>
                            <a className='aapharamcy-reward-container ways-content' onClick={() => handleshowearnwidget()}>
                              <div className='d-flex align-items-center gap-2'>
                                <div className='aapharamcy-reward-icon'>
                                  <img src={yourRewardCoin} className='d-inline' />
                                </div>
                                <div className='aapharamcy-reward-content text-start'>
                                  <h3 className='m-0 fw-normal'>How to earn</h3>
                                </div>
                              </div>
                              <div className='aapharamcy-member-signin'>
                                <p className='p-0 m-0'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
                                    <path d="M1 9L5 5L1 1" stroke="#BEB2AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                </p>
                              </div>
                            </a>
                            <a className='aapharamcy-reward-container ways-content' onClick={() => handleshowredeemwidget()}>
                              <div className='d-flex align-items-center gap-2'>
                                <div className='aapharamcy-reward-icon'>
                                  <img src={redeem} className='d-inline' />
                                </div>
                                <div className='aapharamcy-reward-content text-start'>
                                  <h3 className='m-0 fw-normal'>Ways to redeem</h3>
                                </div>
                              </div>
                              <div className='aapharamcy-member-signin'>
                                <p className='p-0 m-0'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
                                    <path d="M1 9L5 5L1 1" stroke="#BEB2AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                </p>
                              </div>
                            </a>
                            <a className='aapharamcy-reward-container ways-content' href={!(window?.__st?.pageurl.includes('/pages/view-all-voucher')) && 'https://aapharmacy.com.my/pages/view-all-voucher'}>
                              <div className='d-flex align-items-center gap-2'>
                                <div className='aapharamcy-reward-icon'>
                                  <img src={vouchers} className='d-inline' />
                                </div>
                                <div className='aapharamcy-reward-content text-start'>
                                  <h3 className='m-0 fw-normal'>View All Vouchers</h3>
                                </div>
                              </div>
                              <div className='aapharamcy-member-signin'>
                                <p className='p-0 m-0'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
                                    <path d="M1 9L5 5L1 1" stroke="#BEB2AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                </p>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='aapharmacy-terms-condition'>
                    <a href="#" className={`aapharmacy-terms-condition-link ${!(window?.__st?.cid && customer_card_number) ? 'aapharmacy-logout-member' : ''}`} onClick={() => handleterms()}>Terms and Conditions</a>
                  </div>

                </div>
              </div>
            </div>
            <div className='aapharamcy-membership-container widget-page' style={{ display: (earnshow || redeemshow || yourrewardshow || termsshow) ? "block" : "none" }}>
              <div className='aapharamcy-card'>
                <HowToEarnWidget />
                <WaysToRedeemWidget status={redeemshow} rewardlist={getredeemvoucherlist} />
                <YourRewardWidget rewardvoucherlist={rewardvoucherlist} />
                {/* <Termswidget /> */}
              </div>
            </div>
            <div className='aapharamcy-mobile-cross-icon' onClick={vipMemberPopup}>
              <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
            </div>
          </div>
        </> : <></>}
      </div>
    </>

  )
}

export default RewardWidget