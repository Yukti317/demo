import React from 'react'
import titlebaner from '../../assets/img/Vector (1).png'
function Titlebanner({ title, id, handleclick,yourrewardtitle }) {
    return (
        <>
            <div className='titlebanner'>
                <div className='aapharamcy-card-section' >
                    <div className='d-flex p-4 align-items-center'>
                        <div onClick={handleclick} style={{ cursor: 'pointer' }}><img src={titlebaner} alt="" className='me-2' /></div>
                        <p className='breadcrumbs-title header-title' id={id}>{title}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Titlebanner
