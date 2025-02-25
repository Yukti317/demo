import React from 'react'

function InnerSignInCard() {
    return (
        <div className="aapharamcy-member-card">
            <a className='aapharamcy-join-btn mb-2 text-light' href='https://aapharmacy.com.my/account/register'>Join Now button</a>

            <div className='aapharamcy-member-signin mt-3'>
                <p className='p-0 m-0'>Already have an account? <a href="https://aapharmacy.com.my/account/login" className='signin-aapharamcy' >Sign In</a></p>
            </div>
        </div>
    )
}

export default InnerSignInCard