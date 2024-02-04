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

      // try {
        console.log(webhook_data, "e1")
        // console.log(webhook_data[0])
        // console.log(webhook_data[0].accountData)
        console.log("data2: ", webhook_data[0].events.nft)
      //   console.log("data3: ", webhook_data[0].events.nft.nfts[0])
        
      // }
      // catch (error){
      //   console.log(error)
      // }

      // console.log("token: ", token)
      console.log("type: ", webhook_data[0].events.nft.type);
      
      let address;
      if (webhook_data[0].events.nft.type == "NFT_BID"){
        address = webhook_data[0].accountData[4].account
      }else{
        address = webhook_data[0].events.nft.nfts[0].mint;
      }
      
      let token: any = await getAsset(address);

      // Set title based on webhook_data.type
      let title;
      let price_name;
      switch (webhook_data[0].events.nft.type) {
        case 'NFT_SALE':
          title = `${token.content.metadata.name} has been sold!`;
          price_name = "Sale Price";
          break;
        case 'NFT_LISTING':
          title = `${token.content.metadata.name} has been listed.`;
          price_name = "Listing Price";
          break;
        case 'NFT_BID':
          title = `New bid on ${token.content.metadata.name}.`;
          price_name = "New Bid";
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
              "title": title,
              "url": `https://solscan.io/token/${address}`,
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
                  "name": "Date",
                  "value": `<t:${webhook_data[0].timestamp}:R>`,
                  "inline": true
                },
                {
                  "name": "\ ",
                  "value": "\ "
                },
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
      console.log(response)
      res.status(200).json("success")

    };

  }

  catch (err) { console.log(err) }

}
