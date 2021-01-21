const list = (data) => {
  for (const acctData of Object.keys(data?.thirdPartyAccounts || {})) {
    console.log(acctData)
  }
}
