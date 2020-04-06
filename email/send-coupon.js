import QRCode from 'qrcode';
import AWS from "aws-sdk";

import { getCompany } from '../company/get';
import typings from '../typings/coupon';
import typingsCompany from '../typings/company';

const simpleEmailService = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Send the email with coupon to customer
 * @param {typings.Coupon} coupon
 */
export async function sendCouponEmail(coupon) {

    // TODO environment variables
    const tegoedjeEmail = "coupon@tegoedje.nu";
    console.log('Coupon', coupon);

    console.log('About to get the company');
    const company = await getCompany(coupon.companyId);
    console.log('Company', company);

    const redeemUrl = `https://tegoedje.nu/redeem/` + coupon.couponId;
    console.log('About to gen QR for url', redeemUrl);
    const qrCodeSrc = await QRCode.toDataURL(redeemUrl, { type: "image/jpeg" });
    const qrCodeBase64 = qrCodeSrc.split('base64,')[1];

    console.log('About to gen HTML');
    const htmlBody = generateHtmlBody(coupon, company);

    console.log('About to gen email request');
    const request = generateSesEmailRequest({
        htmlBody,
        qrCodeBase64,
        receiverEmail: coupon.customerEmail,
        senderEmail: tegoedjeEmail
    });

    // console.log('Sending email', request);
    const sendPromise = simpleEmailService.sendRawEmail(request).promise();

    const response = await sendPromise;
    console.log('MessageId', response.MessageId);
}

/**
 * @param {Object} params
 * @param {string} params.htmlBody
 * @param {string} params.textBody
 * @param {string} params.receiverEmail
 * @param {string} params.senderEmail
 * @returns {AWS.SES.Types.SendRawEmailRequest}
 */
function generateSesEmailRequest({ htmlBody, receiverEmail, senderEmail, qrCodeBase64 }) {

    // inspired by https://stackoverflow.com/questions/49364199/how-can-send-pdf-attachment-in-node-aws-sdk-sendrawemail-function
    const mail =
`From: 'Tegoedje' <${senderEmail}>
To: ${receiverEmail}
Subject: Tegoedje Coupon
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="NextPart"

--NextPart
Content-Type: text/html

${htmlBody}

--NextPart
Content-Type: image/png; name=\"tegodje-coupon.png\"
Content-Transfer-Encoding: base64
Content-Disposition: attachment

${qrCodeBase64.replace(/([^\0]{76})/g, "$1\n")}

--NextPart--`;

    return {
        Source: senderEmail,
        RawMessage: {
            Data: mail
        }
    };
}

/**
 * @param {typings.Coupon} coupon
 * @param {typingsCompany.Company} company
 * @returns {string}
 */
function generateHtmlBody(coupon, company) {
    const htmlTemplate = `
<div>
    <p>Nogmaals bedankt voor het kopen een Tegoedje ter waarde van €%%amount%% bij %%company%%.</p>
    <p>Wanneer de zaken weer gaan lopen laten we het meteen weten en kunt u het Tegoedje komen verzilveren. De bijgevoegde QR code heb je hiervoor nodig. Dus bewaar deze email goed!</p>
    <p>Deze coupon vervalt vóór 1 januari 2021 en kan niet worden ingewisseld voor contant geld.</p>
</div>
`;
    let htmlBody = htmlTemplate;
    htmlBody = replaceAll(htmlBody, '%%amount%%', coupon.amount);
    htmlBody = replaceAll(htmlBody, '%%company%%', company.companyName);

    return htmlBody;
}

/**
 * @param {string} text
 * @param {string} token
 * @param {string} value
 */
function replaceAll(text, token, value) {
    let result = text;

    while (result.indexOf(token) !== -1) {
        result = result.replace(token, value);
    }

    return result;
}