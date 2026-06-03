// SMS Parser — mamaky SMS Orange, Mvola, Airtel
function parseSMS(smsBody, senderNumber) {
  const text = smsBody.trim();
  let result = null;

  // ORANGE MONEY
  // "Vous avez recu 50000 Ar de 0341234567. Ref: OM2024..."
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

  // MVOLA
  // "Efa noraisina 50000 Ar avy amin'ny 0341234567"
  const mvolaMatch = text.match(/noraisina\s+([\d\s]+)\s*Ar\s+avy\s+amin['']ny\s+([\d]+)/i);
  if (mvolaMatch) {
    return {
      operator: 'Mvola',
      amount: parseInt(mvolaMatch[1].replace(/\s/g, '')),
      senderPhone: mvolaMatch[2],
      currency: 'MGA',
      raw: text
    };
  }

  // MVOLA variant 2
  // "Votre compte a ete credite de 50000 MGA par 034..."
  const mvolaMatch2 = text.match(/credite\s+de\s+([\d\s]+)\s*(?:MGA|Ar)\s+par\s+([\d]+)/i);
  if (mvolaMatch2) {
    return {
      operator: 'Mvola',
      amount: parseInt(mvolaMatch2[1].replace(/\s/g, '')),
      senderPhone: mvolaMatch2[2],
      currency: 'MGA',
      raw: text
    };
  }

  // AIRTEL MONEY
  // "You have received 50000 MGA from 0321234567"
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
