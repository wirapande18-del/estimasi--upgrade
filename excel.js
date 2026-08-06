function findField(row,names){
  const keys=Object.keys(row);
  for(const name of names){
    const key=keys.find(k=>String(k).trim().toLowerCase()===name.toLowerCase());
    if(key && row[key] !== '') return row[key];
  }
  return '';
}

function normalizeSA(value=''){
  const text=String(value).trim().toLowerCase();
  if(text.includes('ayu')) return 'ayu';
  if(text.includes('ajs')) return 'ajs';
  if(text.includes('wbn')) return 'wbn';
  if(text.includes('fik') || text.includes('fix')) return 'fik';
  return text;
}

function customerKey(item){
  return [
    String(item.plate||'').replace(/[^a-z0-9]/gi,'').toLowerCase(),
    String(item.phone||'').replace(/\D/g,''),
    String(item.sa||'').toLowerCase()
  ].join('|');
}

async function readCustomerExcel(file,existingCustomers=[],loggedInUsername='admin'){
  const buffer=await file.arrayBuffer();
  const workbook=XLSX.read(buffer);
  const sheet=workbook.Sheets[workbook.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(sheet,{defval:''});

  const known=new Set(existingCustomers.map(customerKey));
  const imported=[];
  let duplicates=0;
  let assignedToLoggedInUser=0;

  for(const row of rows){
    let sa=normalizeSA(findField(row,['SERVICE_ADVISOR','SA','Service Advisor']));

    if(!sa || !USERS[sa]){
      sa=loggedInUsername;
      assignedToLoggedInUser++;
    }

    const item={
      id:makeId(),
      plate:String(findField(row,['POLICE_NO','No Polisi','Plat Nomor','Nopol'])).trim(),
      customer:String(findField(row,['CUSTOMER','Nama Customer','Customer','Nama'])).trim(),
      model:String(findField(row,['MODEL','Model','Kendaraan'])).trim(),
      sa,
      phone:String(findField(row,['TELEPHONE_CP','No HP','Nomor HP','WA'])).trim(),
      status:'Belum Follow Up',
      followUpAt:'',
      followUpBy:'',
      scores:{},
      suggestion:'',
      responseAt:'',
      followStatus:''
    };

    if(!(item.customer || item.plate || item.phone)) continue;

    const key=customerKey(item);
    if(known.has(key)){
      duplicates++;
      continue;
    }

    known.add(key);
    imported.push(item);
  }

  return {imported,duplicates,totalRows:rows.length,assignedToLoggedInUser};
}

function exportCustomersToExcel(customers){
  const rows=customers.map(item=>({
    'POLICE_NO':item.plate,
    'CUSTOMER':item.customer,
    'MODEL':item.model,
    'SERVICE_ADVISOR':(item.sa||'').toUpperCase(),
    'TELEPHONE_CP':item.phone,
    'STATUS':item.status,
    'Q1':item.scores?.q1||'',
    'Q2':item.scores?.q2||'',
    'Q3':item.scores?.q3||'',
    'Q4':item.scores?.q4||'',
    'Q5':item.scores?.q5||'',
    'Q6':item.scores?.q6||'',
    'Q7':item.scores?.q7||'',
    'Q8':item.scores?.q8||'',
    'Q9 SARAN':item.suggestion||'',
    'RATA-RATA':calculateAverage(item),
    'KATEGORI':overallCategory(item),
    'TINDAK LANJUT':item.followStatus||'',
    'FOLLOW UP OLEH':item.followUpBy||'',
    'WAKTU FOLLOW UP':item.followUpAt||''
  }));

  const sheet=XLSX.utils.json_to_sheet(rows);
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,sheet,'Follow Up');
  XLSX.writeFile(workbook,'follow-up-after-service-v4-5.xlsx');
}
