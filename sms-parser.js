function parseSMS(smsBody, senderNumber) {
  const text = smsBody.trim();

  // MVOLA FORMAT MARINA
  // "10 000 Ar recu de Tokinirina 0343584782 le 03/06/26 a 12:22. Raison: 2."
  const mvolaMatch = text.match(/([\d\s]+)\s*Ar\s+recu\s+de\s+\S+\s+([\d]+)/i);
  if (mvolaMatch) {
    return {
      operator: 'Mvola',
      amount: parseInt(mvolaMatch[1].replace(/\s/g, '')),
      senderPhone: mvolaMatch[2],
      currency: 'MGA',
      raw: text
    };
  }

  // ORANGE MONEY
  const orangeMatch = text.match(/recu\s+([\d\s]+)\s*Ar\s+de\s+([\d]+)/i);
  if (orangeMatch) {
    return {
      operator: 'Orange Money',
      amount: parseInt(orangeMatch[1].replace(/\s/g, '')),
      senderPhone: orangeMatch[2],
      currency: 'MGA',
      raw: text
    };
  }

  // AIRTEL
  const airtelMatch = text.match(/received\s+([\d\s]+)\s*MGA\s+from\s+([\d]+)/i);
  if (airtelMatch) {
    return {
      operator: 'Airtel Money',
      amount: parseInt(airtelMatch[1].replace(/\s/g, '')),
      senderPhone: airtelMatch[2],
      currency: 'MGA',
      raw: text
    };
  }

  return null;
}

module.exports = { parseSMS };
