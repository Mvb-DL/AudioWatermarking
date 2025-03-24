'use client';
import React from 'react';

const DataTerms = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Data Terms</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">1. Allgemeine Hinweise</h2>
        <p>
          Diese Data Terms gelten für die Nutzung der Web-Anwendung "audiomarking". Mit der Nutzung der Anwendung erklärst du dich mit den nachfolgenden Bestimmungen zur Datenverarbeitung einverstanden.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">2. Verwendete Technologien und Services</h2>
        <p>
          Unsere Anwendung basiert auf modernen Web-Technologien und nutzt unter anderem folgende Packages:
        </p>
        <ul className="list-disc list-inside">
          <li>@radix-ui/react-progress</li>
          <li>clsx</li>
          <li>github-markdown-css</li>
          <li>next</li>
          <li>plotly.js-dist-min</li>
          <li>react</li>
          <li>react-cookie-consent</li>
          <li>react-dom</li>
          <li>react-markdown</li>
          <li>remark-gfm</li>
          <li>tailwind-merge</li>
        </ul>
        <p className="mt-2">
          Zudem wird ein externer Microservice verwendet, der zur Erfüllung spezifischer Aufgaben in den Verarbeitungsprozess integriert ist. Es erfolgt jedoch keine Übermittlung personenbezogener Daten an diesen Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">3. Erhobene und verarbeitete Daten</h2>
        <p>
          Es werden ausschließlich serverseitige Logdaten gespeichert, um die technische Funktionalität und Sicherheit der Anwendung zu gewährleisten. Diese Logdaten beinhalten beispielsweise Zugriffszeiten, IP-Adressen und Browserinformationen, jedoch ausschließlich in anonymisierter Form.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">4. Rechtsgrundlage</h2>
        <p>
          Die Erhebung und Verarbeitung der Daten erfolgt auf Grundlage der Einwilligung, die beim Nutzen des Services bzw. beim Akzeptieren der DSGVO eingeholt wird.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">5. Datenweitergabe</h2>
        <p>
          Es werden keine personenbezogenen Daten an Dritte weitergegeben. Sämtliche verarbeiteten Daten bleiben auf unserem Server und werden ausschließlich für interne Zwecke genutzt.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">6. Nutzerrechte</h2>
        <p>
          Nutzer haben das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch hinsichtlich der über sie gespeicherten Daten. Zur Ausübung dieser Rechte oder bei Fragen zum Datenschutz kannst du dich an unseren Datenschutzbeauftragten wenden.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">7. Datensicherheit</h2>
        <p>
          Wir treffen angemessene technische und organisatorische Maßnahmen, um die Sicherheit der Daten zu gewährleisten und unbefugten Zugriff, Verlust oder Missbrauch zu verhindern.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">8. Änderungen dieser Data Terms</h2>
        <p>
          Wir behalten uns vor, diese Data Terms bei Bedarf anzupassen. Änderungen werden auf der Website veröffentlicht und treten mit ihrer Veröffentlichung in Kraft. Es gilt jeweils die aktuellste Version.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Ansprechpartner für Datenschutz</h2>
        <p>
          Bei Fragen zum Datenschutz oder zu diesen Data Terms wende dich bitte an:
        </p>
        <p className="mt-2">
          <strong>Mario von Bassen</strong><br />
          Hartlgasse 17<br />
          1200 Wien
        </p>
      </section>
    </div>
  );
};

export default DataTerms;
