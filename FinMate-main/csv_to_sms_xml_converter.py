#!/usr/bin/env python3
"""
CSV to Android SMS XML Converter
Converts transaction CSV (from iPhone OCR) to Android SMS Backup & Restore XML format
"""

import csv
import re
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom
import hashlib

def parse_date_to_epoch(date_str):
    """Convert various date formats to epoch milliseconds"""
    if not date_str or date_str == '':
        return int(datetime.now().timestamp() * 1000)
    
    # Try different date formats
    formats = [
        '%d-%m-%y',      # 29-11-25
        '%d/%m/%Y',      # 29/11/2025
        '%d/%m/%y',      # 29/11/25
        '%d-%m-%Y',      # 29-11-2025
        '%d-%b-%y',      # 29-Nov-25
        '%d-%b-%Y',      # 29-Nov-2025
        '%d-%B-%y',      # 29-November-25
        '%d-%B-%Y',      # 29-November-2025
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # If year is < 100, assume 2000s
            if dt.year < 100:
                dt = dt.replace(year=dt.year + 2000)
            return int(dt.timestamp() * 1000)
        except ValueError:
            continue
    
    # Default to current time if parsing fails
    print(f"⚠️  Could not parse date: {date_str}, using current time")
    return int(datetime.now().timestamp() * 1000)

def detect_sender_from_body(body, bank_account):
    """Detect bank sender from SMS body"""
    body_lower = body.lower()
    
    # Bank sender patterns
    if 'kotak' in body_lower:
        return 'VK-KOTAK'
    elif 'sbi' in body_lower or 'state bank' in body_lower:
        return 'AD-SBIPSG'
    elif 'hdfc' in body_lower:
        return 'VM-HDFCBK'
    elif 'ippb' in body_lower:
        return 'AD-IPPBMB'
    elif 'axis' in body_lower:
        return 'AX-AXISBK'
    elif 'icici' in body_lower:
        return 'VM-ICICIB'
    elif 'paytm' in body_lower:
        return 'VM-PAYTMB'
    
    # Fallback based on account number
    if bank_account:
        if 'X1583' in bank_account:
            return 'VK-KOTAK'
        elif 'X3146' in bank_account or 'X7717' in bank_account:
            return 'AD-SBIPSG'
        elif 'X1100' in bank_account or 'X5911' in bank_account:
            return 'VM-HDFCBK'
        elif 'X0519' in bank_account:
            return 'AD-IPPBMB'
    
    return 'VK-XXXBANK'

def detect_sms_type(transaction_type, body):
    """Detect SMS type: 1=received (inbox), 2=sent"""
    body_lower = body.lower()
    
    # Type 1 = Received (Credit/Money received)
    if transaction_type == 'received':
        return '1'
    
    # Check body for credit keywords
    if any(keyword in body_lower for keyword in ['received', 'credited', 'credit alert']):
        return '1'
    
    # Type 2 = Sent (Debit/Money sent)
    if transaction_type == 'sent':
        return '2'
    
    # Check body for debit keywords
    if any(keyword in body_lower for keyword in ['sent', 'debited', 'debit']):
        return '2'
    
    # Default to received
    return '1'

def clean_sms_body(raw_sms):
    """Clean and normalize SMS body text"""
    if not raw_sms:
        return ""
    
    # Remove extra whitespace and newlines
    cleaned = ' '.join(raw_sms.split())
    
    # Remove any CSV artifacts
    cleaned = cleaned.replace('""', '"')
    
    return cleaned

def generate_sms_id(body, date, sender):
    """Generate unique SMS ID using hash"""
    content = f"{sender}_{body}_{date}"
    hash_obj = hashlib.md5(content.encode())
    return hash_obj.hexdigest()[:16]

def analyze_csv(csv_file):
    """Analyze CSV structure and content"""
    print("=" * 80)
    print("📊 CSV ANALYSIS")
    print("=" * 80)
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
        print(f"\n✅ Total rows: {len(rows)}")
        print(f"✅ Columns: {', '.join(reader.fieldnames)}")
        
        # Analyze transaction types
        sent_count = sum(1 for row in rows if row['type'] == 'sent')
        received_count = sum(1 for row in rows if row['type'] == 'received')
        print(f"\n📤 Sent transactions: {sent_count}")
        print(f"📥 Received transactions: {received_count}")
        
        # Analyze banks
        banks = {}
        for row in rows:
            sender = detect_sender_from_body(row['rawSMS'], row['bankAccount'])
            banks[sender] = banks.get(sender, 0) + 1
        
        print(f"\n🏦 Banks detected:")
        for bank, count in sorted(banks.items(), key=lambda x: x[1], reverse=True):
            print(f"   - {bank}: {count} messages")
        
        # Check for missing data
        missing_dates = sum(1 for row in rows if not row['date'])
        missing_refs = sum(1 for row in rows if not row['ref'])
        print(f"\n⚠️  Missing dates: {missing_dates}")
        print(f"⚠️  Missing refs: {missing_refs}")
        
        return rows

def convert_to_sms_xml(csv_file, output_file):
    """Convert CSV to Android SMS XML format"""
    print("\n" + "=" * 80)
    print("🔄 CONVERTING TO SMS XML")
    print("=" * 80)
    
    # Read CSV
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    # Create XML structure
    smses = ET.Element('smses', {
        'count': str(len(rows)),
        'backup_set': hashlib.md5(str(datetime.now()).encode()).hexdigest()[:16],
        'backup_date': str(int(datetime.now().timestamp() * 1000)),
        'type': 'full'
    })
    
    processed = 0
    skipped = 0
    
    for idx, row in enumerate(rows, 1):
        try:
            raw_sms = row['rawSMS']
            if not raw_sms or raw_sms.strip() == '':
                print(f"⚠️  Row {idx}: Skipping empty SMS body")
                skipped += 1
                continue
            
            # Clean SMS body
            body = clean_sms_body(raw_sms)
            
            # Parse date
            date_str = row['date']
            date_epoch = parse_date_to_epoch(date_str)
            
            # Detect sender
            sender = detect_sender_from_body(body, row['bankAccount'])
            
            # Detect type (1=received, 2=sent)
            sms_type = detect_sms_type(row['type'], body)
            
            # Create SMS element
            sms_attrs = {
                'protocol': '0',
                'address': sender,
                'date': str(date_epoch),
                'type': sms_type,
                'subject': 'null',
                'body': body,
                'toa': 'null',
                'sc_toa': 'null',
                'service_center': 'null',
                'read': '1',
                'status': '-1',
                'locked': '0',
                'date_sent': str(date_epoch),
                'sub_id': '-1',
                'readable_date': datetime.fromtimestamp(date_epoch / 1000).strftime('%b %d, %Y %I:%M:%S %p'),
                'contact_name': sender
            }
            
            ET.SubElement(smses, 'sms', sms_attrs)
            processed += 1
            
            if processed % 50 == 0:
                print(f"✅ Processed {processed}/{len(rows)} messages...")
                
        except Exception as e:
            print(f"❌ Error processing row {idx}: {e}")
            skipped += 1
            continue
    
    # Pretty print XML
    xml_str = ET.tostring(smses, encoding='utf-8')
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent='  ', encoding='utf-8')
    
    # Remove extra blank lines
    pretty_xml_lines = [line for line in pretty_xml.decode('utf-8').split('\n') if line.strip()]
    final_xml = '\n'.join(pretty_xml_lines)
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_xml)
    
    print(f"\n✅ Successfully processed: {processed} messages")
    print(f"⚠️  Skipped: {skipped} messages")
    print(f"📁 Output file: {output_file}")
    
    return processed, skipped

def validate_xml(xml_file):
    """Validate the generated XML"""
    print("\n" + "=" * 80)
    print("✔️  VALIDATING XML")
    print("=" * 80)
    
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        print(f"✅ XML is well-formed")
        print(f"✅ Root element: <{root.tag}>")
        print(f"✅ Total SMS messages: {len(root.findall('sms'))}")
        print(f"✅ Backup set ID: {root.get('backup_set')}")
        
        # Check for required attributes
        required_attrs = ['protocol', 'address', 'date', 'type', 'body', 'read']
        sample_sms = root.find('sms')
        
        if sample_sms is not None:
            print(f"\n📋 Sample SMS attributes:")
            for attr in required_attrs:
                value = sample_sms.get(attr, 'MISSING')
                status = '✅' if value != 'MISSING' else '❌'
                print(f"   {status} {attr}: {value[:50] if len(str(value)) > 50 else value}")
        
        print(f"\n✅ XML validation complete!")
        return True
        
    except ET.ParseError as e:
        print(f"❌ XML parsing error: {e}")
        return False
    except Exception as e:
        print(f"❌ Validation error: {e}")
        return False

def main():
    """Main execution"""
    print("\n" + "=" * 80)
    print("🔧 CSV TO ANDROID SMS XML CONVERTER")
    print("=" * 80)
    
    csv_file = 'transactions.csv'
    output_file = 'upi_sms_backup.xml'
    
    # Step 1: Analyze CSV
    rows = analyze_csv(csv_file)
    
    # Step 2: Convert to XML
    processed, skipped = convert_to_sms_xml(csv_file, output_file)
    
    # Step 3: Validate XML
    is_valid = validate_xml(output_file)
    
    # Final summary
    print("\n" + "=" * 80)
    print("📊 FINAL SUMMARY")
    print("=" * 80)
    print(f"✅ Total transactions in CSV: {len(rows)}")
    print(f"✅ Successfully converted: {processed}")
    print(f"⚠️  Skipped: {skipped}")
    print(f"✅ XML validation: {'PASSED' if is_valid else 'FAILED'}")
    print(f"📁 Output file: {output_file}")
    print(f"\n🎉 Conversion complete!")
    print(f"\n📱 Next steps:")
    print(f"   1. Transfer '{output_file}' to your Android device")
    print(f"   2. Install 'SMS Backup & Restore' app from Play Store")
    print(f"   3. Open the app and select 'Restore'")
    print(f"   4. Choose the '{output_file}' file")
    print(f"   5. Your FinMate app will now be able to read these SMS messages!")
    print("=" * 80)

if __name__ == '__main__':
    main()
