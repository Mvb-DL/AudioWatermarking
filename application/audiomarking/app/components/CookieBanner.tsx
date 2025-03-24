'use client';
import React from 'react';
import CookieConsent from 'react-cookie-consent';
import Link from 'next/link';

const CookieBanner = () => {
    
  const [gaAccepted, setGaAccepted] = React.useState(false);

  const acceptCookies = () => {
    setGaAccepted(true);
  };

  const declineCookies = () => {
    setGaAccepted(false);
  };

  return (
    <CookieConsent
      location="bottom"
      enableDeclineButton={true}
      onAccept={acceptCookies}
      onDecline={declineCookies}
      cookieName="ledgitFunctionalCookie"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        padding: '10px',
      }}
      buttonText="Akzeptieren"
      buttonStyle={{
        color: '#fff',
        backgroundColor: "#000",
        fontSize: '14px',
        fontWeight: "600",
        padding: '8px 16px',
        width: '130px',
      }}
      declineButtonText="Ablehnen"
      declineButtonStyle={{
        color: '#000',
        backgroundColor: "#fff",
        fontSize: '14px',
        fontWeight: "600",
        padding: '8px 16px',
        width: '130px',
      }}
      buttonWrapperClasses="flex flex-row justify-center"
      expires={150}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-black text-sm">
        <span className="mb-4 md:mb-0 text-center md:text-left">
          <strong>We use Cookies</strong> – Wir sammeln diese Informationen, um deine Web-Erfahrung zu verbessern. Weitere Informationen findest du in unserer Datenschutzerklärung.
        </span>
        <div className="flex flex-col items-center md:flex-row mt-2 md:mt-0">
          <Link href="/legal/data-terms" passHref className="text-gray-800 font-bold hover:underline mb-2 md:mb-0 md:mr-4">
              Data Terms
          </Link>
          <Link href="/legal/notice" passHref className="text-gray-800 font-bold hover:underline">
            Legal notice
          </Link>
        </div>
      </div>
    </CookieConsent>
  );
};

export default CookieBanner;
