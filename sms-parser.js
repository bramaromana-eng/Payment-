function parseSMS(smsBody, senderNumber) {
  const text = smsBody.trim();

  // MVOLA FORMAT 1: 10 000 Ar recu de Nom 034...
  const mvola1 = text.match(/([\d\s]+)\s*Ar\s+recu\s+de\s+\S+\s+([\d]+)/i);
  if (mvola1) return { operator: 'Mvola', amount: parseInt(mvola1[1].replace(/\s/g,'')), senderPhone: mvola1[2], currency: 'MGA', raw: text };

  // MVOLA FORMAT 2: Nahazo X Ar avy any amin ny NOM (034...)
  const mvola2 = text.match(/Nahazo\s+([\d\s]+)\s*Ar\s+avy\s+any\s+amin\s+ny\s+\S+\s+\(([\d]+)\)/i);
  if (mvola2) return { operator: 'Mvola', amount: parseInt(mvola2[1].replace(/\s/g,'')), senderPhone: mvola2[2], currency: 'MGA', raw: text };

  // MVOLA FORMAT 3: Efa noraisina X Ar avy amin'ny 034...
  const mvola3 = text.match(/noraisina\s+([\d\s]+)\s*Ar\s+avy\s+amin['']ny\s+([\d]+)/i);
  if (mvola3) return { operator: 'Mvola', amount: parseInt(mvola3[1].replace(/\s/g,'')), senderPhone: mvola3[2], currency: 'MGA', raw: text };

  // ORANGE MONEY
  const orange = text.match(/recu\s+([\d\s]+)\s*Ar\s+de\s+([\d]+)/i);
  if (orange) return { operator: 'Orange Money', amount: parseInt(orange[1].replace(/\s/g,'')), senderPhone: orange[2], currency: 'MGA', raw: text };

  // AIRTEL
  const airtel = text.match(/received\s+([\d\s]+)\s*MGA\s+from\s+([\d]+)/i);
  if (airtel) return { operator: 'Airtel Money', amount: parseInt(airtel[1].replace(/\s/g,'')), senderPhone: airtel[2], currency: 'MGA', raw: text };

  return null;
}
module.exports = { parseSMS };
