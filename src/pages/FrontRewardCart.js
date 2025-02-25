import React, { useEffect, useState } from 'react'
import { ApiCall } from '../helper/axios';
import { getCookie, setCookie } from '../helper/commonFunction';
import { config_variable } from '../helper/commonApi';

const FrontRewardCart = () => {
    const [totalPoints, setTotalPoints] = useState(0);

    const generateToken = async (data, disocuntCode, e) => {
        const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const { token } = res?.data?.data;
            const expirationHours = 24;
            setCookie("access_token", token, expirationHours);
            if (disocuntCode) {
                verifyVoucher(token, data, disocuntCode, e);
            }
        }
    }


    const fetchProductData = async (token) => {
        await fetch(`/cart.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(cartData => {
                let value = 0;
                // eslint-disable-next-line array-callback-return
                cartData.items.map((datas) => {
                    if (Object.keys(datas.properties).length) {
                        if (datas.properties['Reward Point']) {
                            value += ((datas.properties['Reward Point']) * (datas.quantity));
                        }
                    }
                })
                if (document.querySelector('.total-cart-reward-points span')) {
                    document.querySelector('.total-cart-reward-points span').innerHTML = parseInt(value);
                }
                setTotalPoints(value);
                if (value) {
                    fetch('/cart/update.js', {
                        method: "POST",
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json;'
                        },
                        body: JSON.stringify({
                            attributes: {
                                reward_points: value
                            }
                        })
                    })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    const highRewardPoints = async (data, token) => {
        if (token) {
            const res = await ApiCall('POST', '/high_reward_point', data, { authentication: token }, '1');
            if (res.data.status === 'SUCCESS' && res.status === 200) {
                const rewardPoints = res.data.data.Reward;
                return rewardPoints;
            }
        } else {
            generateToken(0);
        }
    }

    const changeCartData = async (productData) => {
        const rewardPayload = {
            productId: `${productData.product_id}`,
            price: (parseFloat(productData.price) / 100),
        }
        let rewardPoints = null;
        if (getCookie('access_token')) {
            rewardPoints = await highRewardPoints(rewardPayload, getCookie('access_token'));
        } else {
            rewardPoints = await generateToken(0, rewardPayload);
        }

        if (rewardPoints || parseInt(rewardPoints) === 0) {
            const data = {
                'id': `${productData.id}`,
                'properties': { 'Reward Point': parseInt(rewardPoints) }
            }
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(async (cartData) => {
                // add discount of voucher if applied
                const disocuntCode = getCookie('rewardVoucherCode');
                if (disocuntCode) {
                    await fetch(`/discount/${disocuntCode}`).then((res) => {
                        return res.text();
                    }).then(async () => {
                        await window.sidebarCartCallForUpdateData(cartData);
                    })
                } else {
                    await window.sidebarCartCallForUpdateData(cartData);
                }

            })
        }
    }

    const OriginalXMLHttpRequest = window.XMLHttpRequest;

    window.XMLHttpRequest = new Proxy(OriginalXMLHttpRequest, {
        construct(target, args) {
            // Create a new XMLHttpRequest instance
            const xhr = new target(...args);
            // Set up the event listener for readystatechange only if it hasn't been set up before
            if (!xhr.hasOwnProperty('readystatechangeListener')) {
                xhr.addEventListener('readystatechange', async function () {
                    if (xhr.readyState === 4 && xhr.status === 200 && (xhr._url || xhr.responseURL)) {
                        const ajaxUrl = xhr._url || xhr.responseURL;
                        if (ajaxUrl && ajaxUrl.includes('/cart/change')) {
                            if (xhr.response) {
                                if (Object.keys(JSON.parse(xhr.response)).length) {
                                    if (JSON.parse(xhr.response).item_count !== 0) {
                                        fetchProductData();
                                    }
                                }
                            }
                        }
                        if (ajaxUrl && ajaxUrl.includes('/cart/add.js')) {
                            await changeCartData(JSON.parse(xhr.response));
                        }
                    }
                }, false);
                // Flag to indicate that the event listener has been set up
                xhr.readystatechangeListener = true;
            }

            return xhr;
        }
    });

    window.fetch = new Proxy(window.fetch, {
        apply(target, that, args) {
            try {
                let ajaxUrl = '';
                if (args[0] instanceof URL) {
                    ajaxUrl = args[0].href;
                } else if (args[0] instanceof Request) {
                    ajaxUrl = args[0].url;
                } else {
                    ajaxUrl = args[0] || '';
                }
                if (ajaxUrl && ajaxUrl.includes('/cart/add.js')) {
                    const result = target.apply(that, args);
                    result.then((responce) => {
                        return responce.json();
                    }).then(async (responce) => {
                        await changeCartData(responce);
                    })
                }
            } catch (error) {
                console.error('Error in proxy:', error);
            }

            // Ensure to return the result of the original fetch function
            return target.apply(that, args);
        },
    });

    useEffect(() => {
        fetchProductData();

        let checkoutBtn = document.querySelector(".button-checkout");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", async function (e) {
                checkoutBtn.classList.add('is-loading');
                const disocuntCode = getCookie('rewardVoucherCode');
                if (disocuntCode) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // eslint-disable-next-line no-undef
                    const cartData = cart_data;
                    if (cartData && cartData?.total_discount && cartData?.items && cartData?.items.length) {
                        let index = 0;
                        const totalItems = cartData.items.length;
                        let rewardPoints = 0;
                        while (index < totalItems) {
                            const item = cartData.items[index];
                            rewardPoints += parseInt(item.discounted_price / 100);
                            const data = {
                                id: `${item.id}`,
                                properties: { 'Reward Point': parseInt(item.discounted_price / 100) }
                            };
    
                            try {
                                const response = await fetch('/cart/change.js', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(data)
                                });
                                const responseData = await response.json();
                                console.log('/cart/change.js===response', responseData);
                            } catch (error) {
                                console.error(error);
                            }
                            index++;
                        }
                        if (rewardPoints) {
                            try {
                                let updates = {
                                    attributes: { 'reward_points': rewardPoints }
                                };
                                const response = await fetch('/cart/update.js', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(updates)
                                });
                                const responseDatas = await response.json();
                                console.log('/cart/update.js=======response', responseDatas);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                    // eslint-disable-next-line no-undef
                    const customerCardID = customer_card_number
                    // eslint-disable-next-line no-undef
                    const totalCartAmount = total_cart_amount
                    const data = {
                        customer_id: window?.__st?.cid,
                        voucher_code: disocuntCode,
                        cardNo: customerCardID,
                        amount: totalCartAmount ? (totalCartAmount / 100) : 0,
                    }
    
                    if (getCookie('access_token')) {
                        verifyVoucher(getCookie('access_token'), data, disocuntCode, e);
                    } else {
                        generateToken(data, disocuntCode, e);
                    }
                }
            }, true);
        }
    }, []);

    const verifyVoucher = async (token, data, disocuntCode, event) => {
        const res = await ApiCall('POST', '/verifyVoucher', data, { authentication: token }, '1');
        if (res.data.status === 'SUCCESS' && res.status === 200) {
            const response = res.data.data;
            if (response && response.verifed) {
                await fetch(`/discount/${disocuntCode}`).then((res) => {
                    return res.text();
                }).then(() => {
                    window.handleCartCheckoutBtn(event);
                }).catch((err) => {
                    window.handleCartCheckoutBtn(event);
                })
            } else {
                window.handleCartCheckoutBtn(event);
            }
        } else {
            window.handleCartCheckoutBtn(event);
        }
    }

    /* return (
        totalPoints ? <>
            <div class="cart-total-label">
                <span class="text">Points Earned</span>
            </div>
            <div class="cart-total-value">
                <span class="text">{totalPoints}</span>
            </div>
        </> : <></>
    ) */
}

export default FrontRewardCart