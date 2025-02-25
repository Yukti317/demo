import React, { useCallback, useEffect, useState } from 'react';
import { ApiCall } from '../helper/axios';
import { config_variable } from '../helper/commonApi';
import { getCookie, setCookie } from '../helper/commonFunction';
import axios from 'axios';

const AaPharmacyFront = ({ pageurl }) => {
    const [productData, setProductData] = useState({});
    const [rewardPoints, setRewardPoints] = useState('');

    const generateToken = async (flag, data) => {
        const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const { token } = res?.data?.data;
            const expirationHours = 24;
            setCookie("access_token", token, expirationHours);
            if (data) { // data get for recall high_reward_points api cal return to change cart data
                return await highRewardPoints(data, token);
            }
            if (flag) {
                fetchProductData(token);
            }
        }
    }

    const fetchProductData = async (token) => {
        const url = `${window.location.origin}/products/${window.location.pathname.split('products/')[1]}.json`;
        try {
            const response = await axios.get(url);
            if (response.status === 200 && Object.keys(response.data).length) {
                if (Object.keys(response.data.product).length) {
                    setProductData(response.data.product);
                    getRewardPoints(response.data.product, token);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    const addPropertiesCartBuyNow = async () => {
        /* clear the cart data before buy now buttton click */
        try {
            await fetch(`/cart/clear.js`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }).then((response) => {
                return response.json();
            }).then((response) => {
                console.log('response==', response);
            }).catch((error) => {
                throw new Error(`HTTP error! Status: ${error}`);
            })

            /* then we get reward points of current product */
            let varientPrice = parseFloat(productData.variants[0].price);
            let varientID = productData.variants[0].id
            if (productData.variants.length > 1) {
                if (document.querySelector("legend.form__label")) {
                    if (document.querySelector('fieldset input:checked')) {
                        let selectedVarient = productData.variants.filter((item) => item.title === document.querySelector('fieldset input:checked').value)
                        varientPrice = parseFloat(selectedVarient[0].price);
                        varientID = parseFloat(selectedVarient[0].id);
                    }
                }
            }

            const datas = {
                productId: `${productData.id}`,
                price: varientPrice,
            }
            const rewardItemPoints = await highRewardPoints(datas, getCookie('access_token'));
            setRewardPoints(parseInt(rewardItemPoints));

            /* add cart data and properties to cart and then redirect to checkout page */
            let data = {}
            data['form_type'] = 'product';
            data['utf8'] = '✓';
            data['quantity'] = '1';
            data['id'] = varientID;
            data['product-id'] = productData.id;
            data['properties'] = {
                'Reward Point': rewardItemPoints
            }
            data['attributes'] = {
                'reward_points': rewardPoints
            }
            const res = await axios.post('/cart/add.js', data, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json;'
                }
            })
            if (res.status === 200 && res.data) {
                if (Object.keys(res.data).length) {
                    const disocuntCode = getCookie('rewardVoucherCode');
                    if (disocuntCode) {
                        await fetch(`/discount/${disocuntCode}`).then((res) => {
                            return res.text();
                        }).then((res) => {
                            window.location.href = `https://aapharmacy.com.my/checkout`;
                        }).catch((err) => {
                            window.location.href = `https://aapharmacy.com.my/checkout`;
                        })
                    } else {
                        window.location.href = `https://aapharmacy.com.my/checkout`;
                    }
                } else {
                    window.location.href = `https://aapharmacy.com.my/checkout`;
                }
            } else {
                window.location.href = `https://aapharmacy.com.my/checkout`;
            }
        } catch (error) {
            console.log('somethig went wrong!', error);
            window.location.href = `https://aapharmacy.com.my/checkout`;
        }
    }

    const getRewardPoints = async (product, token) => {
        let varientPrice = parseFloat(product.variants[0].price);
        if (product.variants.length > 1) {
            if (document.querySelector("legend.form__label")) {
                if (document.querySelector('fieldset input:checked')) {
                    let selectedVarient = product.variants.filter((item) => item.title === document.querySelector('fieldset input:checked').value)
                    varientPrice = parseFloat(selectedVarient[0].price);
                }
            }
        }

        const data = {
            productId: `${product.id}`,
            price: varientPrice,
        }
        const rewardPoints = await highRewardPoints(data, token);
        setRewardPoints(parseInt(rewardPoints));
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

    useEffect(() => {
        if (pageurl === 'product-page') {
            if (getCookie('access_token')) {
                fetchProductData(getCookie('access_token'));
            } else {
                generateToken(true);
            }
        } else if (!getCookie('access_token')) {
            generateToken(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hanldeBuyNowButtonEvent = async () => {
        let btn = document.querySelector(".shopify-payment-button__button");
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.classList.add('is-loading', 'button');
            addPropertiesCartBuyNow();
        }, true);
    }

    useEffect(() => {
        if (Object.keys(productData).length) {
            hanldeBuyNowButtonEvent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productData]);

    const handleButtonClick = useCallback((event) => {
        if (event.target.matches('.card-quickview button')) {
            setTimeout(() => {
                hanldeBuyNowButtonEvent();
            }, 2000)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleButtonClick);

        return () => {
            document.removeEventListener('click', handleButtonClick);
        };
    }, [handleButtonClick]);

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
                        if (ajaxUrl && ajaxUrl.includes('/cart/add.js')) {
                            await changeCartData(JSON.parse(xhr.response));
                        }
                        if (ajaxUrl && ajaxUrl.includes('/cart/change.js')) {
                            console.log('/cart/change.js', JSON.parse(xhr.response));
                        }
                    }
                }, false);
                // Flag to indicate that the event listener has been set up
                xhr.readystatechangeListener = true;
            }

            return xhr;
        }
    });

    useEffect(() => {
        if (window.fetch) {
            const nativeFetch = window.fetch;
            window.fetch = async function () {
                const response = await nativeFetch(...arguments);
                if (response && response.url.includes('/add.js') && arguments && arguments.length > 0) {
                    try {
                        const responceData = await response.json();
                        if (responceData) {
                            changeCartData(responceData)
                        }
                    } catch (error) {
                        console.log("error------>", error)
                    }
                }
                return response;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        pageurl === 'product-page' && rewardPoints ? <div>
            <span className="productView-info-name">Points:</span>
            <span className="productView-info-value">{rewardPoints}</span>
            {/* <input id="reward-point" type="hidden" value={rewardPoints} name="properties[Reward Point]" /> */}
        </div> : <></>
    )
}

export default AaPharmacyFront