/**
 * Test SMS Parsing Compatibility
 * Tests sample SMS messages from the XML against FinMate's SMS parser
 */

// Import the SMS parser (simulated - adjust path as needed)
// const { parseSMS, categorizeTransaction } = require('./src/services/smsParser');

// Sample SMS messages from the generated XML
const testMessages = [
  {
    name: "Kotak Debit - P2P",
    body: "Sent Rs.29.00 from Kotak Bank AC X1583 to Q376099045@ybl on 29-11-25.UPI Ref 227911213761. Not you, https://kotak.com/KBANKT/Fraud",
    expected: {
      type: "sent",
      amount: 29.00,
      bankAccount: "X1583",
      party: "Q376099045@ybl",
      date: "29-11-25",
      ref: "227911213761",
      category: "P2P"
    }
  },
  {
    name: "Kotak Credit - P2P",
    body: "Received Rs.1897.00 in your Kotak Bank AC X1583 from 9545948928@yescred on 29-11-25.UPI Ref:569919869255.",
    expected: {
      type: "received",
      amount: 1897.00,
      bankAccount: "X1583",
      party: "9545948928@yescred",
      date: "29-11-25",
      ref: "569919869255",
      category: "P2P"
    }
  },
  {
    name: "Kotak Debit - Swiggy (Food)",
    body: "Sent Rs.168.00 from Kotak Bank AC X1583 to swiggy@yespay on 26-11-25.UPI Ref 569609454918. Not you, https://kotak.com/KBANKT/Fraud",
    expected: {
      type: "sent",
      amount: 168.00,
      bankAccount: "X1583",
      party: "swiggy@yespay",
      date: "26-11-25",
      ref: "569609454918",
      category: "Food"
    }
  },
  {
    name: "Kotak Debit - Blinkit (Groceries)",
    body: "Sent Rs.86.00 from Kotak Bank AC X1583 to blinkit.payu@hdfcbank on 19-11-25.UPI Ref 568921468149. Not you, https://kotak.com/KBANKT/Fraud",
    expected: {
      type: "sent",
      amount: 86.00,
      bankAccount: "X1583",
      party: "blinkit.payu@hdfcbank",
      date: "19-11-25",
      ref: "568921468149",
      category: "Groceries"
    }
  },
  {
    name: "Kotak Debit - Airtel (Recharge)",
    body: "Sent Rs.589.00 from Kotak Bank AC X1583 to airtel.payu@axisbank on 17-11-25.UPI Ref 568714120004. Not you, https://kotak.com/KBANKT/Fraud",
    expected: {
      type: "sent",
      amount: 589.00,
      bankAccount: "X1583",
      party: "airtel.payu@axisbank",
      date: "17-11-25",
      ref: "568714120004",
      category: "Recharge/Bills"
    }
  },
  {
    name: "HDFC Credit - P2P",
    body: "Credit Alert! Rs.2900.00 credited to HDFC Bank A/c XX1100 on 04-11-25 from VPA 9529704806@axl (UPI 944146915807)",
    expected: {
      type: "received",
      amount: 2900.00,
      bankAccount: "XX1100",
      party: "9529704806@axl",
      date: "04-11-25",
      ref: "944146915807",
      category: "P2P"
    }
  },
  {
    name: "HDFC Debit - Airtel (Recharge)",
    body: "Sent Rs.589.00 From HDFC Bank A/C *1100 To airtel On 18/10/25 Ref 112843244663 Not You? Call 18002586161/SMS BLOCK UPI to 7308080808",
    expected: {
      type: "sent",
      amount: 589.00,
      bankAccount: "*1100",
      party: "airtel",
      date: "18/10/25",
      ref: "112843244663",
      category: "Recharge/Bills"
    }
  },
  {
    name: "HDFC Debit - Blinkit (Groceries)",
    body: "Sent Rs.667.00 From HDFC Bank A/C *1100 To Blinkit On 17/10/25 Ref 739072052302 Not You? Call 18002586161/SMS BLOCK UPI to 7308080808",
    expected: {
      type: "sent",
      amount: 667.00,
      bankAccount: "*1100",
      party: "Blinkit",
      date: "17/10/25",
      ref: "739072052302",
      category: "Groceries"
    }
  },
  {
    name: "SBI Credit",
    body: "Your A/C XXXXXX314617 has credit for 00000020425 230725 GOOGLE of Rs 2.00 on 25/07/25. Avl Bal Rs 1,011.90.-SBI",
    expected: {
      type: "received",
      amount: 2.00,
      bankAccount: "XXXXXX314617",
      party: "GOOGLE",
      date: "25/07/25"
    }
  },
  {
    name: "IPPB Credit",
    body: "You have received a payment of Rs. 80.00 in a/c X0519 on 17/06/2025 15:06 from sameer santosh kadam thru IPPB. Info: UPI/CREDIT/516879066646.-IPPB",
    expected: {
      type: "received",
      amount: 80.00,
      bankAccount: "X0519",
      party: "sameer santosh kadam",
      date: "17/06/2025",
      ref: "516879066646"
    }
  },
  {
    name: "IPPB Debit",
    body: "A/C X0519 Debit Rs.500.00 for UPI to mukund tukaram on 30-07-25 Ref 009110667313. Avl Bal Rs.70.46. If not you? SMS FREEZE \"full a/c\" to 7738062873-IPPB",
    expected: {
      type: "sent",
      amount: 500.00,
      bankAccount: "X0519",
      party: "mukund tukaram",
      date: "30-07-25",
      ref: "009110667313"
    }
  },
  {
    name: "Kotak Credit - CRED",
    body: "Received Rs.2000.00 in your Kotak Bank AC X1583 from poweraccess.cred@axisbank on 25-11-25.UPI Ref:156404333295.",
    expected: {
      type: "received",
      amount: 2000.00,
      bankAccount: "X1583",
      party: "poweraccess.cred@axisbank",
      date: "25-11-25",
      ref: "156404333295",
      category: "P2P / Merchant"
    }
  },
  {
    name: "Kotak Debit - Paytm",
    body: "Sent Rs.48.00 from Kotak Bank AC X1583 to paytm.s1tor31@pty on 19-11-25.UPI Ref 258961784253. Not you, https://kotak.com/KBANKT/Fraud",
    expected: {
      type: "sent",
      amount: 48.00,
      bankAccount: "X1583",
      party: "paytm.s1tor31@pty",
      date: "19-11-25",
      ref: "258961784253",
      category: "Wallet/Recharge"
    }
  },
  {
    name: "Kotak Debit - Flipkart (Shopping)",
    body: "Sent Rs.792.00 from Kotak Bank AC X1583 to flipkart.hypg@yespay on 13-10-25.UPI Ref 177257241875. Not you, https://kotak.com/KBANKT/Fraud",
    expected: {
      type: "sent",
      amount: 792.00,
      bankAccount: "X1583",
      party: "flipkart.hypg@yespay",
      date: "13-10-25",
      ref: "177257241875",
      category: "Shopping"
    }
  }
];

console.log("=" .repeat(80));
console.log("SMS PARSING COMPATIBILITY TEST");
console.log("=" .repeat(80));
console.log("\nTesting sample SMS messages against FinMate parser patterns...\n");

// Regex patterns from smsParser.ts
const SMS_PATTERNS = [
  // Kotak Bank - Debit
  {
    pattern: /Sent Rs\.([\d.]+) from (.*?) to (.*?) on (\d{2}-\d{2}-\d{2}).*?UPI Ref[ :]*(\d+)/i,
    type: 'sent',
    name: 'Kotak Debit'
  },
  // Kotak Bank - Credit
  {
    pattern: /Received Rs\.([\d.]+) in your (.*?) from (.*?) on (\d{2}-\d{2}-\d{2}).*?UPI Ref[: ]*(\d+)/i,
    type: 'received',
    name: 'Kotak Credit'
  },
  // HDFC - Credit
  {
    pattern: /Rs\.([\d.]+) credited to (.*?) on (\d{2}-\d{2}-\d{2}).*?VPA (.*?) \(UPI (\d+)\)/i,
    type: 'received',
    name: 'HDFC Credit'
  },
  // IPPB - Credit
  {
    pattern: /received a payment of Rs\.? ?([\d.]+).*?a\/c (.*?) on (\d{2}\/\d{2}\/\d{4}).*?Info: UPI\/CREDIT\/(\d+)/i,
    type: 'received',
    name: 'IPPB Credit'
  },
  // IPPB - Debit
  {
    pattern: /A\/C (.*?) Debit Rs\.([\d.]+) for UPI to (.*?) on (\d{2}-\d{2}-\d{2}) Ref (\d+)/i,
    type: 'sent',
    name: 'IPPB Debit'
  }
];

function testParsing(message) {
  for (const { pattern, type, name } of SMS_PATTERNS) {
    const match = message.body.match(pattern);
    if (match) {
      return {
        matched: true,
        patternName: name,
        type: type,
        groups: match.slice(1)
      };
    }
  }
  return { matched: false };
}

let passed = 0;
let failed = 0;

testMessages.forEach((test, idx) => {
  console.log(`\n${idx + 1}. ${test.name}`);
  console.log("-".repeat(80));
  console.log(`SMS: "${test.body.substring(0, 80)}..."`);
  
  const result = testParsing(test);
  
  if (result.matched) {
    console.log(`✅ MATCHED: ${result.patternName}`);
    console.log(`   Type: ${result.type}`);
    console.log(`   Captured Groups: ${result.groups.length}`);
    
    // Verify expected values
    const typeMatch = result.type === test.expected.type;
    console.log(`   ${typeMatch ? '✅' : '❌'} Type matches expected: ${test.expected.type}`);
    
    if (typeMatch) {
      passed++;
    } else {
      failed++;
    }
  } else {
    console.log(`❌ NO MATCH - Pattern not recognized`);
    console.log(`   Expected: ${test.expected.type} transaction`);
    failed++;
  }
});

console.log("\n" + "=".repeat(80));
console.log("TEST SUMMARY");
console.log("=".repeat(80));
console.log(`Total Tests: ${testMessages.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success Rate: ${((passed / testMessages.length) * 100).toFixed(1)}%`);
console.log("\n" + "=".repeat(80));

if (passed === testMessages.length) {
  console.log("🎉 ALL TESTS PASSED! Your SMS messages are fully compatible!");
} else if (passed / testMessages.length >= 0.8) {
  console.log("✅ MOSTLY COMPATIBLE - Most messages will parse correctly");
} else {
  console.log("⚠️  SOME ISSUES - Review failed patterns");
}

console.log("=".repeat(80));
