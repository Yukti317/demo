/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import placeanorder from '../../assets/img/place_order.png'
import signIn from '../../assets/img/sign-in.png'
import Titlebanner from './Titlebanner'
import InnerSignInCard from './InnerSignInCard'
import { ApiCall, GetApiCall } from '../../helper/axios'
import { config_variable } from '../../helper/commonApi'
import { getCookie, setCookie } from '../../helper/commonFunction'
import tickSvg from '../../assets/img/tick.png'
import { Spinner } from '@shopify/polaris'
function HowToEarnWidget() {
  const [earnpointlistdata, Setearnpointlistdata] = useState([])
  const [loading, setLoading] = useState(false)
  const generateToken = async () => {
    const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
    if (res.data.status === 'success' && res.data.statusCode === 200) {
      const { token } = res?.data?.data;
      const expirationHours = 24;
      setCookie("access_token", token, expirationHours);
      getredeemlist(token)
    }
  }

  const getredeemlist = async (token) => {
    setLoading(true)
    // eslint-disable-next-line no-undef
    const res = await GetApiCall('GET', '/get_user_earn_listing', { authentication: token }, '1')
    if (res.data.status === 'SUCCESS' && res.status === 200) {
      Setearnpointlistdata(res.data.data)
      setLoading(false)
    }
  }
  useEffect(() => {
    if (getCookie('access_token')) {
      getredeemlist(getCookie('access_token'));
    } else {
      generateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handlebackbutton = () => {
    if (document.getElementById("howtoearn")) {
      document.getElementById("howtoearn").style.display = "none"
      document.getElementById("rewardwidget").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.home-page").style.display = "block"
      document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "none"
      document.querySelector(".aapharamcy-membership-container.widget-page #howtoearn").style.display = "none"
      document.querySelector('.voucher-floating-icon-container').classList.remove('voucher-floating-icon-custom-height');
    }
  }

  return (
    <div className='position-relative aapharamcy-inner-card h-100' id='howtoearn' style={{ display: "none" }}>
      <Titlebanner title={'How to earn'} id={'howToEarnTitle'} handleclick={() => handlebackbutton()} />
      {!loading ? <>
        <div className={`aapharmacy-howtoearn-container ${!(window?.__st?.cid && customer_card_number) ? 'height-300' : ''}`}>
          <div className='aapharamcy-earn-card'>
            <div className='aapharamcy-member-list-vip'>
              {earnpointlistdata.length && earnpointlistdata ? earnpointlistdata.map((data) => {
                return (
                  <a className='aapharamcy-earn-container d-flex align-items-center justify-content-between text-decoration-none py-3'>
                    <div className={`d-flex align-items-center gap-3 ${data.point_type === '2' && customer_card_number ? 'opacity' : ''}`}>
                      <div className='aapharamcy-reward-icon'>
                        <img src={data.point_type === '1' ? placeanorder : signIn} alt='img' className='d-inline' />
                      </div>
                      <div className='aapharamcy-earn-content text-start'>
                        <h3 className='m-0 fw-normal text-overflow-manage'>{data.title}</h3>
                        <p className='mb-0'>{data.earning_value} AA VIP Point for every RM 1 spent</p>
                      </div>
                      {data.point_type === '2' && customer_card_number ? <div className='tick-svg-applyCode ms-3'><img className='opacity' width={20} src={tickSvg} alt='tickSvg' /></div> : ''}
                    </div>
                  </a>
                )
              }) : <div className='no-record-for-redeemandearn'>No Records to display!</div>}
            </div>
          </div>
        </div>
      </> : <div className='widgetspinner'> <Spinner /></div>}
      {!(window?.__st?.cid && customer_card_number) && <InnerSignInCard />}
    </div>
  )
}

export default HowToEarnWidget