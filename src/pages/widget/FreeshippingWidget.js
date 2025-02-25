import React, { useState } from 'react'
import Titlebanner from './Titlebanner'
import clipIcon from '../../assets/img/coupon-code-icon.svg'
import { Spinner } from '@shopify/polaris'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setCookie } from '../../helper/commonFunction';
import tickSvg from '../../assets/img/tickSvg.png'

function FreeshippingWidget({ status, redeemvoucher, loader, redeemtitle, className,  titleid, id,message }) {
  const [applyCode, setApplyCode] = useState('Apply code')
  const notify = (message) => {
    const id = toast.success(message, {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
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
  const handlebackbutton = () => {
    if (document.querySelector(".aapharamcy-membership-container.widget-page")) {
      
      if (className === 'yourrewardvoucher') {
        if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.yourrewardvoucher').style.display = 'none'
        document.getElementById("yourreward").style.display = "block"
      }
      if (className === 'WaysToRedeemWidget') {
        if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.WaysToRedeemWidget').style.display = 'none'
        document.getElementById("howtoredeem").style.display = "block"
      }
      if (className === 'incrementalvoucher') {
        if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.incrementalvoucher').style.display = 'none'
        document.getElementById("howtoredeem").style.display = "block"
      }
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
      document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
    }
  }
  async function copyClipBoard(voucherCode) {
    var copyText = voucherCode;
    try {
      await navigator.clipboard.writeText(copyText);
      notify('Code copied to clipboard!');

    } catch (err) {
      notify('Failed to copy!');
    }
  }

  const handleAplly = async () => {
    setApplyCode(<div className='btnspinner'><Spinner size='small' /></div>)
    const rewardVoucherCode = status ? redeemvoucher : document.getElementById(id)?.innerHTML;
    await fetch(`/discount/${rewardVoucherCode}`).then((res) => {
      return res.text();
    }).then(async (res) => {
      setCookie('rewardVoucherCode', rewardVoucherCode, 0)
      setApplyCode(<div className='tick-svg-applyCode'><img height={30} width={30} src={tickSvg} alt='tickSvg' /></div>)
      setTimeout(() => {
        setApplyCode('Apply code')
      }, 500)
    })
  }
  const vouchercodereward = document.getElementById(id)?.innerHTML

  return (
    <div style={{ display: "none" }} className={className} id='freeshiping'>
      <Titlebanner title={!loader ? status ? redeemtitle : '' : ''}  id={titleid} status={status} handleclick={() => handlebackbutton()} />
      {!loader ? <>
      {message !== 'your point is not enough for this redeem' ? 
        <div className="aapharamcy-member-card mt-3">
          <h3 className='m-0 mb-1'>Here is your reward</h3>
          <p className='p-0 m-0 mb-2'>Earn AA Points for different actions, and turn those AA Points into awesome rewards!</p>
          <div className='aapharamcy-member-free-shi-coupon'>
            <div className='voucher-card-copy-input mb-2'>
              <div className="d-flex justify-content-between align-items-center w-100">
                {status && <p className='m-0 p-0'>{redeemvoucher && redeemvoucher}</p>}
                <p id={id} className='coupn-code'></p>
                <div className='voucher-clipboard-icon' onClick={() => { copyClipBoard(status ? redeemvoucher : vouchercodereward) }}>
                  <img src={clipIcon} className='clipboard-icon' alt='copy-clipBoard-img' />
                </div>
              </div>
            </div>
            <button className='aapharamcy-join-btn my-2' onClick={() => { handleAplly() }}>{applyCode}</button>
          </div>
        </div>:<div className='no-record-for-redeemandearn p-3'>your point is not enough for this redeem!</div>}

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
      </> : <div className='widgetspinner '> <Spinner /></div>}

    </div>
  )
}

export default FreeshippingWidget
