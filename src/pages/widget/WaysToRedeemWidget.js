/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import coupon from '../../assets/img/coupon.png'
import freeShipping from '../../assets/img/free-shipping.png'
import CouponTen from '../../assets/img/10-coupon.png'
import dicsount from '../../assets/img/discount.png'
import freeproduct from '../../assets/img/place_order.png'
import Titlebanner from './Titlebanner'
import InnerSignInCard from './InnerSignInCard'
import { ApiCall, GetApiCall } from '../../helper/axios'
import { config_variable } from '../../helper/commonApi'
import { getCookie, setCookie } from '../../helper/commonFunction'
import FreeshippingWidget from './FreeshippingWidget'
import Incrimentalwidget from './Incrimentalwidget'
import Freeproductwidget from './Freeproductwidget'
import { Spinner } from '@shopify/polaris'

function WaysToRedeemWidget({ status, rewardlist }) {
  const [rewardlistdata, setRewardlistdata] = useState([])
  const [loading, setLoading] = useState(false)
  const [redeemvoucher, setRedeemvoucher] = useState([])
  const [redeemid, setRedeemid] = useState(0)
  const [incrementmaxvalue, setIncrementmaxvalue] = useState(0)
  const [message, setMessage] = useState('')
  const [incrementminvalue, setIncrementminvalue] = useState(0)
  const [redeemdata, setreemdata] = useState({
    redeemid: 0,
    redeemused: false,
    redeemtitle: ''
  })
  const [redeemtitle, setRedeemtitle] = useState()
  const [redeempoints, setRedeempoints] = useState()
  const [redeemprize, setRedeemprize] = useState()
  const [redeemused, setRedeemused] = useState()
  const [pointcost, setPointcost] = useState()
  const [producttitle, setProducttitle] = useState()
  const [popup, setPopup] = useState(false)
  const [loader, setLoader] = useState(false)

  const generateToken = async (redeemid, redeemused, redeemtitle) => {
    const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
    if (res.data.status === 'success' && res.data.statusCode === 200) {
      const { token } = res?.data?.data;
      const expirationHours = 24;
      setCookie("access_token", token, expirationHours);
      getredeemlist(token);
      if (redeemid) {
        redeemvouchercode(token, redeemid, redeemused, redeemtitle);
      }
    }
  }

  const getredeemlist = async (token) => {
    setLoading(true)
    // eslint-disable-next-line no-undef
    const res = await GetApiCall('GET', '/get_user_redeems', { authentication: token }, '1')
    if (res.data.status === 'SUCCESS' && res.status === 200) {
      setRewardlistdata(res.data.data)
      setLoading(false)
    }
  }


  const redeemvouchercode = async (token, redeemid, redeemused, redeemtitle) => {
    setLoader(true)
    const data = {
      id: redeemid,
      repeat_status: !redeemused ? 1 : 2,
      customerId: `${window?.__st?.cid}`,
      cardNo: `${customer_card_number}`
    }
    const res = await ApiCall('POST', '/redeem_voucher_code', data, { authentication: token }, '1')
    if (res.data.message === 'your point is not enough for this redeem') {
      setMessage(res.data.message)
      setLoader(false)
      setPopup(false);
    }
    if (res.status === 200) {
      if (getCookie('balance')) {
        let newBalance = (parseInt(getCookie('balance')) - res.data.data.cardPoints);
        if (document.querySelector('.aapharamcy-member-signin.current-balance b')) {
          document.querySelector('.aapharamcy-member-signin.current-balance b').innerHTML = newBalance;
        }
        if (document.querySelector('.my-reward-points b')) {
          document.querySelector('.my-reward-points b').innerHTML = `Points: ${newBalance}`
        }
        setCookie('balance', newBalance);
      }
      setRedeemvoucher(res.data.data.newData)
      setLoader(false)
      setPopup(false);
      const newState = rewardlistdata.map((item) => {
        if (item.redeem.id === redeemid) {
          if (item.redeem_used === false) {
            return ({
              ...item,
              redeem_used: true
            })
          }
        }
        return { ...item };
      });
      setRewardlistdata(newState)
      rewardlist(token)
      setRedeemtitle(redeemtitle)
    }
  }

  const handlebackbutton = () => {
    setPopup(false)
    if (document.querySelector(".aapharamcy-membership-container.home-page")) {
      document.querySelector("#howtoredeem").style.display = "none"
      document.querySelector(".aapharamcy-membership-container.home-page").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "none"
      document.querySelector('.voucher-floating-icon-container').classList.remove('voucher-floating-icon-custom-height');

    }
  }
  const handlefreeshipping = (redeemid, redeemused, redeemtitle, pointtype, redeempoints, redeempriz, pointcost, producttitle, incrementmaxvalue, incrementminvalue) => {
    setRedeemtitle(redeemtitle)
    setRedeempoints(redeempoints)
    setRedeemprize(redeempriz)
    setRedeemid(redeemid)
    setRedeemused(redeemused)
    setPointcost(pointcost)
    setProducttitle(producttitle)
    setIncrementmaxvalue(incrementmaxvalue)
    setIncrementminvalue(incrementminvalue)
    if (pointtype === '5') {
      if (document.getElementById("howtoredeem")) {
        document.getElementById("howtoredeem").style.display = "none"
        document.querySelector(".aapharamcy-membership-container.widget-page #freeproductwidget").style.display = "block"
        document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        document.querySelector(".aapharamcy-membership-container.widget-page #incremental").style.display = "none"
      }
    } else if (pointtype === '2') {
      if (document.getElementById("howtoredeem")) {
        document.getElementById("howtoredeem").style.display = "none"
        document.querySelector(".aapharamcy-membership-container.widget-page #incremental").style.display = "block"
        document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        if (document.querySelector('#freeShipTitle')) document.querySelector('#freeShipTitle').innerHTML = redeemtitle
      }
    } else {
      if (redeemused) {
        const data = { ...redeemdata }
        data.redeemid = Number(redeemid)
        data.redeemused = redeemused
        data.redeemtitle = redeemtitle
        setPopup(true)
        setreemdata(data)
      } else {
        if (document.getElementById("howtoredeem")) {
          document.getElementById("howtoredeem").style.display = "none"
          if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.WaysToRedeemWidget').style.display = 'block'
          document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        }
        if (getCookie('access_token')) {
          redeemvouchercode(getCookie('access_token'), redeemid, redeemused, redeemtitle)
        } else {
          generateToken(redeemid, redeemused, redeemtitle);
        }
      }
    }

  }

  const Continuepopup = () => {
    if (document.getElementById("howtoredeem")) {
      document.getElementById("howtoredeem").style.display = "none"
      if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.WaysToRedeemWidget').style.display = 'block'
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
    if (getCookie('access_token')) {
      redeemvouchercode(getCookie('access_token'), redeemdata.redeemid, redeemdata.redeemused, redeemdata.redeemtitle);
    } else {
      generateToken(redeemdata.redeemid, redeemdata.redeemused, redeemdata.redeemtitle);
    }
  }
  const date = new Date().getTime();

  useEffect(() => {
    if (getCookie('access_token')) {
      getredeemlist(getCookie('access_token'));
    } else {
      generateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className='position-relative h-100 aapharamcy-inner-card' id='howtoredeem' style={{ display: "none" }}>
        <Titlebanner title={'How to redeem'} id={'waysRedeemTitle'} handleclick={() => handlebackbutton()} />
        {!loading ? <>
          <div className={`aapharmacy-howtoearn-container  ${!(window?.__st?.cid && customer_card_number) ? 'height-300' : ''}`}>
            <div className='aapharamcy-earn-card'>
              <div className='aapharamcy-member-list-vip'>
                {rewardlistdata.length && rewardlistdata ? rewardlistdata.map((data) => {
                  return (
                    <>
                      <a className='aapharamcy-earn-container d-flex align-items-center justify-content-between text-decoration-none py-3' >
                        <div className='d-flex align-items-center gap-3'>
                          <div className='aapharamcy-reward-icon'>
                            <img src={data?.redeem?.point_type === '1' ? coupon : data?.redeem?.point_type === '2' ? CouponTen : data?.redeem?.point_type === '3' ? dicsount : data?.redeem?.point_type === '4' ? freeShipping : freeproduct} alt='img' className='d-inline' />
                          </div>
                          <div className='aapharamcy-earn-content text-start'>
                            <h3 className='m-0 fw-normal text-overflow-manage'>{data?.redeem?.title}</h3>
                            <p className='mb-0'>  {data?.redeem?.point_type === '2' ? `${data?.redeem?.customer_redeem_increment} Ponits = RM${data?.redeem?.customer_gets}` : `${data?.redeem?.point_cost} AA VIP points`}</p>
                          </div>
                        </div>
                        {window?.__st?.cid && customer_card_number ? <button class={`aapharamcy-redeem-btn mb-2 ${date > new Date(data.redeem.discount_expire_date).getTime() ? 'unactive' : ''}`} disabled={date > new Date(data.redeem.discount_expire_date).getTime()} onClick={() => { handlefreeshipping(data?.redeem?.id, data?.redeem_used, data?.redeem?.title, data?.redeem?.point_type, data?.redeem?.customer_redeem_increment, data?.redeem?.customer_gets, data?.redeem?.point_cost, data.productTitle, data.redeem.incremental_max_amount, data.redeem.incremental_min_amount) }}>Redeem</button> : ''}
                      </a>

                    </>
                  )
                }) : <div className='no-record-for-redeemandearn'>No Records to display!</div>}
                {popup &&
                  <div className="popupcard" id='popcard'>
                    <div className='aapharamcy-member-signin'>
                      <p className='p-0 m-2 text-start'>You already have a reward available. Only one can be used per order - are you sure you want to redeem another reward?</p>
                    </div>
                    <div className='d-flex justify-content-center align-items-stretch mt-3'>
                      <button className='aapharamcy-cancel-btn  me-2' onClick={() => setPopup(false)}>Cancel</button>
                      <button className='aapharamcy-join-btn how-toredeem-continue pad-12' onClick={() => Continuepopup()}>Continue</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </> : <div className='widgetspinner'> <Spinner /></div>}

        {!(window?.__st?.cid && customer_card_number) && <InnerSignInCard />}
      </div>
      <FreeshippingWidget className={'WaysToRedeemWidget'} titleid={'waystoredeemid'} status={status} redeemvoucher={redeemvoucher} id={'WaysToRedeemWidget'} loader={loader} redeemtitle={redeemtitle} message={message} />
      <Incrimentalwidget status={status} redeemtitle={redeemtitle} redeempoints={redeempoints} redeemprize={redeemprize} rewardlist={rewardlist} redeemid={redeemid} redeemused={redeemused} getredeemlist={getredeemlist} incrementmaxvalue={incrementmaxvalue} incrementminvalue={incrementminvalue} />
      <Freeproductwidget redeemtitle={redeemtitle} pointcost={pointcost} rewardlist={rewardlist} redeemid={redeemid} redeemused={redeemused} getredeemlist={getredeemlist} producttitle={producttitle} />
    </>
  )
}

export default WaysToRedeemWidget