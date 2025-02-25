import React, { useState } from 'react';
import moment from 'moment';
import Titlebanner from './Titlebanner'
import FreeshippingWidget from './FreeshippingWidget'
import coupon from '../../assets/img/coupon.png'
import freeShipping from '../../assets/img/free-shipping.png'
import CouponTen from '../../assets/img/10-coupon.png'
import dicsount from '../../assets/img/discount.png'
import freeproduct from '../../assets/img/place_order.png'

function YourRewardWidget({ rewardvoucherlist }) {
    const [vouchercode, setvoucher] = useState()
    const [title, settitle] = useState()
    
    const handlefreeshipping = (vouchercode, title) => {
        setvoucher(vouchercode)
        if (document.getElementById("yourreward")) {
            document.getElementById("yourreward").style.display = "none"
           
            if (document.querySelectorAll('#freeshiping').length) document.querySelector('#freeshiping.yourrewardvoucher').style.display = 'block'
            if (document.querySelector('#yourrewardvoucher')) document.querySelector('#yourrewardvoucher').innerHTML = vouchercode
    
            if (document.querySelector('#yourrewardvoucherid')) document.querySelector('#yourrewardvoucherid').innerHTML = title
            document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        }
        settitle(title)
    }
    const handlebackbutton = () => {
        if (document.getElementById("howtoearn")) {
            document.getElementById("howtoearn").style.display = "none"
            document.getElementById("rewardwidget").style.display = "block"
            document.querySelector(".aapharamcy-membership-container.home-page").style.display = "block"
            document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "none"
            document.querySelector(".aapharamcy-membership-container.widget-page #yourreward").style.display = "none"
            document.querySelector('.voucher-floating-icon-container').classList.remove('voucher-floating-icon-custom-height');
        }
    }
    
    return (
        <>
            <div className='position-relative aapharamcy-inner-card h-100' id='yourreward' style={{ display: 'none' }}>
                <Titlebanner title={'My Rewards'} id={'yourRewardTitle'} handleclick={() => handlebackbutton()} />
                <div className='aapharmacy-howtoearn-container'>
                    <div className='aapharamcy-earn-card'>
                        <div className='aapharamcy-member-list-vip'>
                            {rewardvoucherlist.length && rewardvoucherlist ? rewardvoucherlist.map((data) => {
                                return (
                                    <a className='aapharamcy-earn-container d-flex align-items-center justify-content-between text-decoration-none py-3' onClick={() => handlefreeshipping(data.voucher_code,data.title)}>
                                        <div className='d-flex align-items-center gap-3'>
                                            <div className='aapharamcy-reward-icon'>
                                                <img src={data?.point_type === '1' ? coupon : data?.point_type === '2' ? CouponTen : data?.point_type === '3' ? dicsount : data?.point_type === '4' ? freeShipping : freeproduct} alt='freeshiping' className='d-inline' />
                                            </div>
                                            <input type='hidden' id='voucher-reward' />
                                            <div className='aapharamcy-earn-content text-start'>
                                                <h3 className='m-0 fw-normal'>{data.title}</h3>
                                                {/* <p className='mb-0'>{data.point_type === '4' ? "Use this discount code on your next order!" :data?.point_type === '2' ? `${data?.point} Ponits = RM${data?.value}`: `${data.point_cost} AA VIP points`}</p> */}
                                                <p className='mb-0'>Expires: {data.expiryDate}</p>
                                            </div>
                                        </div>
                                        <div class="aapharamcy-member-signin">
                                            <p class="p-0 m-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 9L5 5L1 1" stroke="#BEB2AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                            </p>
                                        </div>
                                    </a>
                                )

                            }) : <div className='no-record-for-redeemandearn'>No Records to display!</div>}

                        </div>
                    </div>

                </div>
            </div>
            <FreeshippingWidget titleid={'yourrewardvoucherid'} vouchercode={vouchercode} yourrewardtitle={title} id={'yourrewardvoucher'} className={'yourrewardvoucher'}/>
        </>
    )
}

export default YourRewardWidget
