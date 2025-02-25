import React from 'react'
import Titlebanner from './Titlebanner'

function Termswidget({ status }) {

    const handlebackbutton = () => {
        if (document.querySelector(".aapharamcy-membership-container.home-page")) {
            document.querySelector(".aapharamcy-membership-container.home-page").style.display = "block"
            document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "none"
            document.querySelector(".aapharamcy-membership-container.widget-page #terms").style.display = "none"
            document.querySelector('.voucher-floating-icon-container').classList.remove('voucher-floating-icon-custom-height');
        }
    }
    return (
        <div className='h-100' style={{ display: "none" }} id='terms'>
            <Titlebanner title={'Terms and Conditions'} id={'termsWidgetTitle'} handleclick={() => handlebackbutton()} />
            <div className='terms-condition-container'>
                <h3 className='terms-title'> AA VIP MEMBERSHIP LOYALTY PROGRAM – TERMS AND CONDITIONS (FOR MEMBER)</h3>

                <p className='head'> <strong> SERVICE AGREEMENT </strong></p>
                <p className='content1'>“VIP Membership Loyalty Program” (hereafter called the SERVICE) refers to the member-exclusive service provided by AA Pharmacy Healthcare Sdn Bhd and its affiliated companies (hereafter called the COMPANY) for VIP members. This AGREEMENT is made and agreed to between YOU and the COMPANY.</p>


                <p className='head'> <strong> A. DECLARATION </strong></p>
                <ol className='content'>
                    <li>YOU confirm that YOU have full knowledge, understanding, and acceptance of all the terms and conditions of this AGREEMENT upon registration as AA VIP Member. YOUR successful registration for and use of the SERVICE constitutes YOUR consent to be bound by this AGREEMENT.</li>
                    <li>YOU agree that the COMPANY reserves the right to amend this AGREEMENT at any time, in the COMPANY’s sole discretion, by posting any such amendment(s) to the COMPANY’s website without prior and separate notice. YOUR continued use of the SERVICE after amendment to the AGREEMENT is posted will be deemed as full knowledge and acceptance of the revised AGREEMENT. If YOU do not agree to any such amendment(s), YOUR sole recourse shall be to cease using the SERVICE.</li>

                </ol>

                <p className='head'> <strong> B. AA VIP MEMBERS ACCOUNT </strong></p>
                <ol className='content' >
                    <li>Membership is open to individuals who are 18 years of age and above. Residents and non-residents of Malaysia (who must carry telco number from Malaysia) or downloaded AA Mobile App may apply for membership.</li>
                    <li>No annual fee will be charged for the Membership at the moment and it is lifetime membership.</li>
                    <li>This membership program is not entitle for <b> wholesale account</b>.</li>
                    <li>“AA VIP MEMBER”: Each member will carry a unique number on the virtual membership card by downloading through AA Mobile App and YOU may set a password for the purpose of enquiry and calculation of points or for redeeming other related benefits.</li>
                    <li>Member service: AA VIP Membership service offered by the COMPANY includes:
                       <p><b>a. Point accumulation:</b> For every RM1 worth of purchase, AA VIP Members will earn 1 point.</p>
                       <p><b>b. Point redemption:</b> Points can be redeemed for use in purchases at AA Pharmacy. The conversion rate is: 200 points – RM1. Minimum redemption is a block of 1000 points which is equal to RM5.</p>
                       <p><b>c. Member events and discount benefits.</b></p>
                    </li>
                    <li>“Member” or “Members” means individual(s) who has been accepted by AA Pharmacy as participating member(s) of the Program in accordance to the Terms and Conditions set forth herein; “Membership” means membership to the Program in accordance to the Terms and Conditions herein; “Points” means the points awarded to Members for purchases and redemption of Rewards at participating AA Pharmacy or Merchants’ outlets; “Program” means the AA VIP Membership Loyalty Program operated by AA Pharmacy; “Rewards” means the vouchers, products, services, rewards, gifts or other benefits made available by AA Pharmacy under a rewards program established by AA Pharmacy which may be redeemed by Members.</li>
                    <li>These Terms and Conditions (including the Policy on Privacy and Data Protection) govern the award and use of Points by Members, and set out the terms of the agreement between AA Pharmacy and each Member with regards to the Program. A person intending to participate in the Program can sign up and register for the Program with AA Pharmacy by applying for VIP Membership and can then earn Points on various purchases at participating AA Pharmacy outlets. By applying to register with the Program or using the mobile app, a Member is deemed to have accepted these Terms and Conditions. AA Pharmacy may, in its sole discretion decide and without the need to assign any reason, refuse an application made by any person to be a Member.</li>
                    <li>AA Pharmacy reserves the right to, at any time, vary or terminate the Program or any privileges under the Program or withdraw the membership from use without prior notification to Members and without being liable in any way to Members. AA Pharmacy may, at its sole discretion, remove any or all Members from the Program at any time.</li>
                    <li>The Program is operated by:
                        <p>AA Pharmacy Healthcare Sdn Bhd</p>
                        <p>No. 11, Jalan Pemaju U1/15, Seksyen U1, Hicom Glenmarie Industrial Park, 40150 Shah Alam, Selangor.</p>
                        <p>(Contact) <b style={{color:'#cd5c5c'}}> +603-5562 8811 </b></p>
                    </li>
                </ol>

                <p className='head'> <strong> C. AA VIP MEMBERSHIP CARD </strong></p>
                <ol className='content'>
                    <li>Members can get the virtual version of the membership card via downloading from mobile app, without any purchase, charges and it is non-transferable. It is not a credit card, debit card or a charge card.</li>
                    <li>A Member may use virtual membership card only in participating Merchants’ outlets or at such places or on such items as AA Pharmacy may specify from time to time.</li>
                    <li>Membership card (virtual) must be presented to the cashier of the AA Pharmacy outlets or participating Merchants’ outlets BEFORE each purchase to record the amount spent. Membership PRESENTED AFTER THE TRANSACTION WILL NOT BE ACCEPTED FOR POINT ACCUMULATION.</li>
                </ol>

                <p className='head'><strong>D. AA VIP MEMBERSHIP POINT</strong></p>
                <ol className='content'>
                    <li>A Member should receive 200 membership points for the first time registration as welcome points from AA Pharmacy.</li>
                    <li>There shall be no accumulation of Points for backdated receipts, special savings, offers, bulk purchases and sales, unless otherwise stated.</li>
                    <li>POINT ACCUMULATION WILL BEGIN FROM NIL. Members are advised to keep all receipts for at least 6 months of each qualifying period in the event of discrepancies in the accumulated Points.</li>
                    <li>Point accumulate will be auto-converted to cash voucher value RM 5 when it reach 1000 and above. Conversion will COMMENCE on the next month in every 10 – 11, or 25 – 26 of the month and sometimes it will take around one month. After converted, the cash voucher expiry will be one year from the date of Point converted.</li>
                    <li>Points will be awarded at the rate agreed by AA Pharmacy when a Member purchases goods (except for cash vouchers purchase) at AA Pharmacy outlets within 24 hours’ time. AA Pharmacy may alter the method and rate at which Points are awarded at its discretion from time to time and AA Pharmacy may revise from time to time.</li>
                    <li>Points WILL NOT BE AWARDED for the certain items for any brands of Milk Powder, Sanitary Pad, Diapers, selected medicines or other items under the Company’s discretion from time to time.</li>
                    <li>Redemption of Points will be processed after the application details for redemption has been received by AA Pharmacy. Once redemption has been accepted by AA Pharmacy, it cannot be cancelled, exchanged or returned.</li>
                    <li>Points cannot be exchanged for cash and can only be used for redemption of cash vouchers. AA Cash Vouchers may be redeemed by a Member using Points.</li>
                    <li>Cash voucher can be combined upon payment.</li>
                    <li>Points cannot be redeemed until they are credited into the Membership account of the Member. Points will be recorded in the Member’s account only after AA Pharmacy has notified the details of the relevant transaction which Points are issued.</li>
                    <li>Points redemption subject to the Member complying with the procedures for redemption.</li>
                </ol>

                <p className='head'><strong>E. PRIVACY PROTECTION</strong></p>
                <ol className='content'>
                    <li>YOUR acceptance of this AGREEMENT or YOUR act of using the SERVICE constitutes YOUR consent to the use, application and disclosure of YOUR personal information by the COMPANY according to the following provisions and the Privacy Policy.</li>
                    <li>YOU are required to set a password upon registration as identification of YOUR AA VIP Membership. Security question and the answer to it shall be provided for password recovery. The password is the sole means by which YOU get access to YOUR account. Once YOU divulge YOUR password to others, YOUR personal identification information may subject to theft, thus leading to legal consequences to YOUR disadvantage. Should YOU sense any potential or realistic threat, arising from whatever reason, to the application of YOUR username and password, YOU shall contact the COMPANY immediately, and shall not hold the COMPANY liable for any loss or damage incurred prior to the COMPANY’s action against the threat.</li>
                    <li>AA Pharmacy reserves the right to block a Member from accessing his account online if AA Pharmacy has reasonable grounds to suspect that fraud or misconduct has been committed by the Member or a third party. While AA Pharmacy uses reasonable efforts to include up to date information in the mobile app, Website and in all its publications, AA Pharmacy makes no warranties or representations as to their accuracy, reliability, completeness or otherwise.</li>
                    <li>AA VIP membership system is using INCARD loyalty platform as technology provider. By registering, you are also deemed to accept the terms and conditions of INCARD loyalty platform. Please visit <a href='https://www.incard.my/membership/termsnconditions.html' style={{color:'#cd5c5c',wordBreak:'break-word'}}>  https://www.incard.my/membership/termsnconditions.html </a>for more information.</li>
                </ol>
                <p className='head'> <strong>F. SYSTEM HALT OR FAILURE</strong></p>
                <ol className='content'>
                    <li>The COMPANY shall not be liable for any loss or damage in the event of system halt or non-performance of the SERVICE as a result of the following causes:</li>
                    <li>Servers are down for maintenance with relevant notice posted on the AA website by the COMPANY;</li>
                    <li>Data communication fails as a result of telecommunication equipment failure;</li>
                    <li>The COMPANY’s system fails due to circumstances beyond its reasonable control, including typhoon, earthquake, tsunami, flooding, electrical power failure, war, acts of terrorism, and other force majeure incidents.</li>
                    <li>Service is interrupted or delayed for reasons such as hacker attacks, technical adjustment or system breakdown on the part of telecommunication providers, website upgrades, technical difficulties with banking systems, etc.</li>
                </ol>
                <p className='head'><strong>G. LIMITATION OF LIABILITIES</strong></p>
                <ol className='content'>
                    <li>The COMPANY is responsible only for obligations expressly stated in this AGREEMENT.</li>
                    <li>The AA VIP Membership user data is offered by the user on voluntary basis. The COMPANY does not guarantee the accuracy, timeliness, completeness of any information provided in connection with the SERVICE. YOU shall take full responsibility for YOUR own judgment.</li>
                    <li>Partners of the SERVICE are responsible for the quality and content of the service they provide, for which the COMPANY bears no liability.</li>
                    <li>YOU must evaluate and bear all risks associated with the use of any content downloaded or acquired through the SERVICE. YOU shall take full responsibility for any damage or loss of data on YOUR computer system caused by YOUR decision to download the information.</li>
                    <li>No advice or information, whether oral or written, obtained by YOU from the COMPANY or its staff, or through the service shall create any warranty on the SERVICE not expressly stated by the COMPANY.</li>
                    <li>To the extent permitted by law, the COMPANY shall in no event be liable for any indirect, punitive, special or incidental damages associated with or arising from this AGREEMENT, whether in breach of this AGREEMENT (including breach of warranty), tort or of whatever causes, even if the COMPANY has been advised of the possibility of such damages. The COMPANY disclaims any responsibility for the aforementioned damages notwithstanding any claim that a sole or exclusive remedy provided in this AGREEMENT may or does fail of its essential purpose.</li>
                </ol>
                <p className='head'><strong>H. TRADEMARK AND INTELLECTUAL PROPERTY RIGHTS PROTECTION</strong></p>
                <ol className='content'>
                    <li>All intellectual property rights (including without limitation to trademark, patent, copyright, trade secret, etc.) of the AA website and its content (including without limitation to the texts, photos, documents, information, reference, website framework, website graphics and webpage design) are owned by the COMPANY or its affiliated companies as permitted by law.</li>
                    <li>None of the programming information or content of the AA Pharmacy website may be used, revised, copied, transmitted, altered, disseminated, distributed or publicized without prior written consent from the COMPANY or its affiliated companies.</li>
                    <li>YOU are obliged to respect intellectual property rights, the breach of which may render YOU liable for damages incurred.</li>
                </ol>
                <p className='head'> <strong>I. JURISDICTION</strong></p>
                <ol className='content'>
                    <li>The law of Malaysia governs this AGREEMENT, the effectiveness, interpretation, modification, application and dispute resolution of which shall be dealt with in accordance with relevant provisions thereby, or pursuant to applicable international business convention and (or) prevailing industry practices in cases where the law of Malaysia fails to provide.</li>
                    <li>Any disputes arising from this AGREEMENT shall be dealt with in accordance with relevant law of Malaysia . Relevant lawsuits shall be filed to the people’s court of the place where AA Pharmacy Health Care Sdn. Bhd. is located.</li>
                    <li>All Rewards and Gift Vouchers are subject to availability and further subject to all applicable legal rules and the terms and conditions (including priority level, selection criteria and limitations of liability) as imposed by AA Pharmacy.</li>
                    <li>Notification of any matter in relation to the Program shall be deemed given to Members if it is made via any one of the methods below:
                        <p>a. by posting on the Mobile app; Website; SMS or</p>
                        <p>b. by sending an email to Members who have provided email address to AA Pharmacy; or</p>
                        <p>c. by publication in a newspaper; or</p>
                        <p>d. Sending by ordinary post to the last known address of Members appearing in AA Pharmacy records.</p>
                    </li>
                    <li>AA Pharmacy will only be liable to a Member (and not any other third party) who suffers loss in connection with the Program arising from Points being wrongly deducted or non-credit of Points entitled by a Member and in such a case, AA Pharmacy’s sole liability will be limited to crediting to the relevant Member’s account such Points which have been wrongly deducted or should have been credited but were not. AA Pharmacy shall not be responsible where: (i) there is no breach of a legal duty of care owed to such Member by AA Pharmacy or by any of AA Pharmacy’s employees, staffs, authorized personnel or agents; or (ii) such loss or damage is not a reasonably foreseeable result of any such breach at the time AA Pharmacy enters into this agreement with such Member; or (iii) any increase in loss or damage resulting from breach by such Member of the Program.</li>
                    <li>AA Pharmacy and the Merchants are not responsible or liable to the Members for indirect, consequential or economic losses, loss of profits, loss of opportunity or punitive damages of any kind.</li>
                </ol>

                <h3 className='terms-title'> END OF TERMS & CONDITIONS</h3>
            </div>
        </div>
    )
}

export default Termswidget
