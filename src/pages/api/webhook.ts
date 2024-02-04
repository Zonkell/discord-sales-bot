const rpc = `https://rpc.helius.xyz/?api-key=${process.env.HELIUS_KEY}`

const getAsset = async (token: string) => {
  const response = await fetch(rpc, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: {
        id: token
      },
    }),
  });
  const { result } = await response.json();
  return result;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "POST") {

      const webhook: any = process.env.DISCORD_WEBHOOK

      let webhook_data = req.body


      console.log("data1:" ,webhook_data[0])
      console.log("data2: ", webhook_data[0].events.nft)

      let type = webhook_data[0].events.nft.type; 
      
      // saleType = "OFFER" OR "AUCTION" or something else?
      let saleType = webhook_data[0].events.nft.saleType; 
      let marketplace = webhook_data[0].events.nft.source
      
      let address;
      if (type == "NFT_BID" && saleType == "OFFER"){
        address = webhook_data[0].accountData[4].account
      }else{
        address = webhook_data[0].events.nft.nfts[0].mint;
      }

      // Get the token data
      let token: any = await getAsset(address);

      let title;
      let price_name;
      
      // title = `${token.content.metadata.name} has been sold!`;
      switch (webhook_data[0].events.nft.type) {
        case 'NFT_SALE':
          title = `${token.content.metadata.name} has been sold`;
          price_name = "Sale Price";
          break;
        case 'NFT_LISTING':
          title = `${token.content.metadata.name} has been listed`;
          price_name = "Listing Price";
          break;
        case 'NFT_BID':
          if (webhook_data[0].events.nft.saleType == "OFFER"){
            title = `New offer on ${token.content.metadata.name}`;
            price_name = "Offer";
          }else{
            title = `New bid on ${token.content.metadata.name}`;
            price_name = "Bid";
          }
          break;
        default:
          title = `${token.content.metadata.name} has been sold!`; // Default to sale if type is not recognized
          price_name = "Sale Price"; // Default to sale if type is not recognized
      }

      const response = await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({

          "content": null,
          "embeds": [
            {
              "title": `**${title}**`,
              "color": 10272442,
              "fields": [
                // {
                //   "name": "\ ",
                //   "value": "\ "
                // },
                // {
                //   "name": "\ ",
                //   "value": "\ "
                // },
                {
                  "name": price_name,
                  "value": "**" + (webhook_data[0].events.nft.amount / 1000000000).toFixed(2) + " " + "SOL**",
                  "inline": true
                },
                {
                  "name": "Marketplace",
                  "value": marketplace,
                  "inline": true
                },
                // {
                //   "name": "\ ",
                //   "value": "\ "
                // },
                // {
                //   "name": "Buyer",
                //   "value": webhook_data[0].events.nft.buyer.slice(0, 4) + '..' + webhook_data[0].events.nft.buyer.slice(-4),
                //   "inline": true
                // },
                // {
                //   "name": "Seller",
                //   "value": webhook_data[0].events.nft.seller.slice(0, 4) + '..' + webhook_data[0].events.nft.seller.slice(-4),
                //   "inline": true
                // }
              ],
              "image": {
                "url": token.content.files[0].uri
              },
              // timestamp: new Date().toISOString(),
              // "footer": {
              //   "text": "Helius",
              //   "icon_url": "https://assets-global.website-files.com/641a8c4cac3aee8bd266fd58/642b5b2804ea37191a59737b_favicon-32x32.png",
              // }
            }
          ],

        },
        ),
      });
      // console.log(response)
      res.status(200).json("success")

    };

  }

  catch (err) { console.log(err) }

}
