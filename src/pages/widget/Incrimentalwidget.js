/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import Titlebanner from './Titlebanner'
import CouponTen from '../../assets/img/10-coupon.png'
import { getCookie, setCookie } from '../../helper/commonFunction'
import FreeshippingWidget from './FreeshippingWidget'
import { ApiCall } from '../../helper/axios'
import { config_variable } from '../../helper/commonApi'

function Incrimentalwidget({ redeemtitle, redeempoints, redeemprize, rewardlist, redeemid, redeemused, getredeemlist, incrementmaxvalue }) {
  const balance = getCookie("balance");
  const [changevalue, setChangevalue] = useState(0)
  const [changePrice, setChangePrice] = useState(0)
  const [loader, setLoader] = useState(false)
  const [redeemvoucher, setRedeemvoucher] = useState('')
  const [redeempricevalue, setRedeempricevalue] = useState(0)
  const [message, setMessage] = useState('')
  const [redeemdata, setreemdata] = useState({
    redeemid: 0,
    redeemused: false,
  })
  const [popup, setPopup] = useState(false)
  const generateToken = async (flag) => {
    const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
    if (res.data.status === 'success' && res.data.statusCode === 200) {
      const { token } = res?.data?.data;
      const expirationHours = 24;
      setCookie("access_token", token, expirationHours);
      if (flag) {
        redeemvouchercode(token);
      }
    }
  }

  const handlevouchercodepage = () => {
    if (redeemused) {
      const data = { ...redeemdata }
      data.redeemid = redeemid
      data.redeemused = redeemused
      setPopup(true)
      setreemdata(data)
    } else {
      if (document.getElementById("howtoredeem")) {
        document.getElementById("howtoredeem").style.display = "none"
        document.getElementById("incremental").style.display = "none"
        if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.incrementalvoucher').style.display = 'block'
        if (document.querySelector('#incrementalid')) document.querySelector('#incrementalid').innerHTML = redeemtitle
        document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
      }
      if (getCookie('access_token')) {
        redeemvouchercode(getCookie('access_token'))
      } else {
        generateToken(1);
      }
    }

  }

  const handlebackbutton = () => {
    setPopup(false)
    if (document.querySelector(".aapharamcy-membership-container.widget-page")) {
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
      document.getElementById("howtoredeem").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.widget-page #incremental").style.display = "none"
      setChangePrice(0)
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
  }

  const Changevalue = (value) => {
    const prices = (parseInt(value) * parseInt(redeemprize) / redeempoints)
    setChangePrice(prices);
    setChangevalue(parseInt(value))
  }

  const redeemvouchercode = async (token) => {
    setLoader(true)
    setPopup(false)
    const data = {
      id: redeemid,
      repeat_status: !redeemused ? 1 : 2,
      customerId: `${window?.__st?.cid}`,
      cardNo: `${customer_card_number}`,
      point: changevalue,
      money: changePrice ? changePrice : redeempricevalue
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
      getredeemlist(token)
      rewardlist(token)
    }
  }

  useEffect(() => {
    if (!loader && redeemvoucher) {
      if (document.querySelector('#incrementalvoucher')) document.querySelector('#incrementalvoucher').innerHTML = redeemvoucher
      if (document.querySelector('#incrementalid')) document.querySelector('#incrementalid').innerHTML = redeemtitle
    }
  }, [loader, redeemvoucher])

  const Continuepopup = () => {
    if (document.getElementById("incremental")) {
      document.getElementById("incremental").style.display = "none"
      if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.incrementalvoucher').style.display = 'block'
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
    if (getCookie('access_token')) {
      redeemvouchercode(getCookie('access_token'));
    } else {
      generateToken(1);
    }
  }

  function calculateValue(a, b) {
    // Calculate the maximum multiple of b that is less than or equal to a
    const maxMultiple = Math.floor(a / b);

    // Calculate the result using the correct multiple of b
    const result = b * maxMultiple;

    return result;
  }

  useEffect(() => {
    if (balance && redeempoints) {
      setChangevalue(calculateValue(parseInt(incrementmaxvalue ? incrementmaxvalue : balance), parseInt(redeempoints)))
    }
  }, [balance, redeempoints, incrementmaxvalue])

  useEffect(() => {
    if (changevalue && redeemprize && redeempoints) {
      setRedeempricevalue((parseInt(changevalue) * parseInt(redeemprize) / redeempoints))
    }
  }, [changevalue, redeemprize, redeempoints])

  return (
    <>
      <div style={{ display: "none" }} id='incremental'>
        <Titlebanner id={'freeShipTitle'} handleclick={() => handlebackbutton()} />
        <div className="aapharamcy-member-card mt-3">
          <div className='d-flex align-items-center gap-3 p-4 pt-2 pb-2'>
            <div className='aapharamcy-reward-icon'>
              <img src={CouponTen} alt='img' className='d-inline' />
            </div>
            <div className='aapharamcy-earn-content text-start'>
              <h3 className='m-0 fw-normal'>{redeemtitle}</h3>
              <p className='mb-0'>  {`${redeempoints} Ponits = RM${redeemprize}`}</p>
            </div>
          </div>
          <div className='p-4 pt-2 pb-2 ms-3'>
            {redeempricevalue && <h3 className='m-0 fw-normal'> {changevalue} Ponits for RM{changevalue !== 0 ? changePrice ? changePrice : redeempricevalue : 0} off</h3>}
          </div>
          <div className="range p-4 ms-3">
            <input type="range" min={0} max={incrementmaxvalue ? incrementmaxvalue : balance} className='inputtt' step={redeempoints} value={changevalue} onChange={(e) => Changevalue(e.target.value)} />
          </div>
          <div className='aapharamcy-member-free-shi-coupon'>
            <button className='aapharamcy-join-btn my-2' disabled={changevalue === 0} onClick={() => handlevouchercodepage()}>Redeem</button>
          </div>
        </div>
        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
      {popup &&
        <div className="popupcard" id='popcard'>
          <div className='aapharamcy-member-signin'>
            <p className='p-0 m-2 text-start'>You already have a reward available. Only one can be used per order - are you sure you want to redeem another reward?</p>
          </div>
          <div className='d-flex justify-content-center align-items-stretch mt-3'>
            <button className='aapharamcy-cancel-btn mb-2 me-2' onClick={() => setPopup(false)}>Cancel</button>
            <button className='aapharamcy-join-btn how-toredeem-continue mb-2 pad-12' onClick={() => Continuepopup()}>Continue</button>
          </div>
        </div>
      }
      <FreeshippingWidget titleid={'incrementalid'} redeemvoucher={redeemvoucher} loader={loader} id={'incrementalvoucher'} className={'incrementalvoucher'} message={message} />
    </>

  )
}

export default Incrimentalwidget
