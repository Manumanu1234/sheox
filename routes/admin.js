var express = require('express');
var router = express.Router();
var producthelper = require('../producthelper/producthelpers')
const multer = require("multer");
const { response, path } = require('../app');
const upload = multer({ dest: 'uploads/' })
const userhelpers = require("../producthelper/userhelpers")
var pdf = require("pdf-creator-node");
const fs=require("fs")
const path1 = require('path');
const puppeteer1 = require('puppeteer');
var validitycheckingfun = function (req, res, next) {
  if (req.session.adminlogin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}
/* GET home page. */
router.get('/', validitycheckingfun, function (req, res, next) {
  producthelper.findfeturedproduct().then((totoal) => {
    console.log(totoal)
    res.render('admin/admin', { admin: true, totoal });
  })


});
router.get('/login', (req, res) => {
  if (req.session.loginerr) {
    res.render('admin/adminlogin', { loginerr: true });
    //commit
    req.session.loginerr=false;
  } else {
    res.render('admin/adminlogin');
  }

})
router.post("/admindetails", (req, res) => {
  producthelper.veryfiylogin(req.body).then((response) => {
    if (response.status) {
      console.log("password true")
      req.session.adminlogin = true;
      res.redirect('/admin')
    } else {
      console.log('password worng')
      req.session.loginerr = true;
      res.redirect('/admin/login')
    }
  })
})

router.get("/logout", (req, res) => {
  req.session.destroy()
  res.redirect('/admin/login')
})
router.get('/addtoproduct', validitycheckingfun, (req, res) => {
  console.log('call camming')
  res.render('admin/addproductmanagement', { admin: true })
})

const fileStorageEngineProduct = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("stage 1");
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + '--' + file.originalname)
  }
})


const uploadProduct = multer({ storage: fileStorageEngineProduct })


router.post('/addtoproductsubmint', uploadProduct.fields([{ name: 'imagename1', maxCount: 1 }, { name: 'imagename2', maxCount: 1 }, { name: "imagename3", maxCount: 1 }]), async (req, res) => {
  var totalfile = req.files;
  const fileArray = Object.values(totalfile);
  const flattenedArray = fileArray.flat()

  var toatlproductname = await flattenedArray.map((file) => {
    return file.filename;
  })
  console.log(toatlproductname)

  console.log('dude')
  req.body.images = toatlproductname;
  req.body.price = parseInt(req.body.price)
  await producthelper.addtoproduct(req.body, (result) => {

    console.log('completed dudde')
    console.log(result)
    res.redirect('/admin/addtoproduct')

  })


})

router.get('/viewproduct', validitycheckingfun, (req, res) => {
  producthelper.getAllproduct().then((totaproduct) => {
    var totaproduct = totaproduct.map((product, index) => {
      return { ...product, index }
    })
    res.render('admin/viewproduct', { admin: true, totaproduct })
  })

})

router.get('/deletebutton/:id', validitycheckingfun, (req, res) => {
  console.log(req.params.id)
  producthelper.deleteproduct(req.params.id).then(() => {
    res.json({ status: true })
  })
})

router.get('/editbutton/', validitycheckingfun, (req, res) => {
  console.log(req.query.id)
  producthelper.editbutton(req.query.id).then((response) => {

    res.render('admin/editpage', { admin: true, response })
  })
})
router.post('/editpagepost/:id', uploadProduct.fields([{ name: 'imagename1', maxCount: 1 }, { name: 'imagename2', maxCount: 1 }, { name: "imagename3", maxCount: 1 }]), async (req, res) => {
  console.log(req.params.id)
  //const newbody = JSON.stringify(req.body);


  console.log(req.body)
  console.log('called')
  var totalfile = req.files;
  const fileArray = Object.values(totalfile);
  const flattenedArray = fileArray.flat()

  var toatlproductname = await flattenedArray.map((file) => {
    return file.filename;
  })
  console.log(toatlproductname)

  console.log('dude')
  req.body.images = toatlproductname;
  req.body.price = parseInt(req.body.price)
  producthelper.editproduct(req.params.id, req.body).then((response) => {
    res.redirect('/admin/viewproduct')
  })
})
const widgetstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("stage 1");
    cb(null, './public/upladbanner')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + '--' + file.originalname)
  }
})
const uploadmanu = multer({ storage: widgetstorage })

router.get("/widget", validitycheckingfun, (req, res) => {
  producthelper.getbanner().then((response) => {
    console.log(response)
    let totresponse = response.map((res, index) => {
      return { ...res, index }
    })

    producthelper.findoffers().then((updates) => {
      let totalofferupdate = updates.map((pro, index) => {
        return { ...pro, index }
      })
      res.render('admin/widget', { admin: true, totresponse, totalofferupdate })
    })



  })

})
router.post('/widget', uploadmanu.array('bannerimage', 1), (req, res) => {
  var filenames = req.files.map(function (file) {
    return file.filename;
  });
  req.body.bannerimage = filenames;
  producthelper.addBanner(req.body).then(() => {

    res.redirect('/admin/widget')
  })

})

router.get('/removebanner/:id', validitycheckingfun, (req, res) => {
  console.log(req.params.id)
  producthelper.deletebanner(req.params.id).then(() => {
    res.json({ response })
  })
})
router.get("/removebanneroffers/:id", validitycheckingfun, (req, res) => {
  producthelper.deletebanneroffers(req.params.id).then(() => {
    res.json({ response })
  })
})


const widgetoffer = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("stage 1");
    cb(null, './public/upladbanner')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + '--' + file.originalname)
  }
})
const widgetofferupdate = multer({ storage: widgetoffer })


router.post("/offerwidget", widgetofferupdate.single("updateimage"), (req, res) => {
  console.log(req.file.filename)
  console.log("hell")
  producthelper.updateoffers(req.file.filename).then(() => {
    res.redirect("/admin/widget")

  })
})

router.get("/featured/:id", (req, res) => {
  producthelper.featuredproductlist(req.params.id).then((response) => {
    res.json(response)
  })
})

router.get("/removebookmark/:id", validitycheckingfun, (req, res) => {
  producthelper.removebookmark(req.params.id).then((response) => {
    res.json(response)
  })
})

router.get("/offermanagement", validitycheckingfun, (req, res) => {
  producthelper.offercatogorycolecting()
    .then((cato) => {
      console.log("Category collected:", cato);
      producthelper.offercalling().then((collecte1) => {
        console.log(collecte1);
        console.log("unifome", collecte1)
        producthelper.coupongetting().then((coupon) => {
          //coupon comming
          if (collecte1 == undefined && coupon == 0) {
            res.render("admin/offermanagent", { admin: true, cato });
            console.log(coupon)
            console.log("varunnilllaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
          } else if (coupon == 0 && collecte1 != undefined) {
            let collecte2 = collecte1.array;
            res.render("admin/offermanagent", { admin: true, cato, collecte2 });
          } else if (collecte1 == undefined && coupon != 0) {
            res.render("admin/offermanagent", { admin: true, cato, coupon });
          } else {
            let collecte2 = collecte1.array;
            console.log(coupon)
            res.render("admin/offermanagent", { admin: true, cato, collecte2, coupon });
          }
        })
      })

    })
    .catch((error) => {
      console.error("Error in offercatogorycolecting:", error);
      res.status(500).send('Internal Server Error');
    });

});

router.post("/offermanagement", validitycheckingfun, (req, res) => {
  console.log(req.body)
  let body = req.body.catogory;
  let price = req.body.discountprice
  console.log(body, price)
  producthelper.offerupdate(req.body).then((arr) => {
    producthelper.offercatogorycolecting(body, price)
      .then((cato) => {


        if (arr == 1) {
          producthelper.offercalling().then((collecte1) => {
            let collecte2 = collecte1.array;
            res.render("admin/alredyadded");
          })

        } else {
          producthelper.offerandprice(body, price).then(() => {
            console.log("ok added");
            producthelper.offercalling().then((collecte1) => {
              producthelper.coupongetting().then((coupon) => {
                //coupon comming
                if (collecte1 == undefined && coupon == 0 || collecte1.array.length == 0 && coupon == 0) {
                  res.render("admin/offermanagent", { admin: true, cato });
                  console.log(coupon)
                  console.log("varunnilllaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                } else if (coupon == 0 && collecte1 != undefined || collecte1.array.length != 0 && coupon == 0) {
                  let collecte2 = collecte1.array;
                  res.render("admin/offermanagent", { admin: true, cato, collecte2 });
                } else if (collecte1 == undefined && coupon != 0 || collecte1.array.length == 0 && coupon != 0) {
                  res.render("admin/offermanagent", { admin: true, cato, coupon });
                } else {
                  let collecte2 = collecte1.array;
                  console.log(coupon)
                  res.render("admin/offermanagent", { admin: true, cato, collecte2, coupon });
                }
              })
            })

          })

        }





      })
      .catch((error) => {
        console.error("Error in offercatogorycolecting:", error);
        res.status(500).send('Internal Server Error');
      });
    console.log("discount added")

  })

})

router.post("/removeoffer/", (req, res) => {
  let catogory = req.body.id;
  let price = req.body.price;
  producthelper.offerremoving(catogory, price).then(() => {
    producthelper.removingfromoffandprice(catogory).then(() => {
      res.json({ response });
    })

  })



}),
  router.post("/couponmanagement", (req, res) => {
    console.log(req.body)
    producthelper.couponcollection(req.body).then(async () => {
      res.redirect("/admin/offermanagement");
    });
  })


router.get("/totalorders", async (req, res) => {
  producthelper.allorderfind().then((totalorder) => {
    res.render("admin/totalorders", {admin:true,totalorder,invoice:false })
  })
  
})

router.get("/invoiceofeachorder/:id", (req, res) => {
  console.log(req.params.id)
  producthelper.allorderfind().then((totalorder) => {
    producthelper.findinginvoice(req.params.id).then((totalorder1) => {
      console.log(totalorder1.productcollection)
      userhelpers.orderdetailsgetting(totalorder1.product).then((totalcollection) => {
        console.log(totalcollection)
        console.log("kkk")
     
        let addresdetails = totalorder1.productcollection;
        console.log(addresdetails)
        res.render("admin/totalorders", {admin:true, totalorder, addresdetails, totalcollection,invoice:true })

      })
    })
  })



})
const puppeteer = require('puppeteer');

router.get("/totalorderpdf", async (req, res) => {
  try {
    const totalorder = await producthelper.allorderfind(); // Fetch the total orders data

    // Define your HTML content
    let html = `<html>
<head>
    <meta charset="utf-8" />
    <title>Total Orders</title>
    <style>
        table, th, td {
            border: 2px solid black;
            border-collapse: collapse;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1 style="text-align: center;">TOTAL ORDERS</h1>
    <div class="container">
        <table style="width:100%">
            <thead>
                <tr style="font-size: large;">
                    <th>Name Address and Number</th>
                    <th>Date And Time</th>
                    <th>Payment Method</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>`;

    // Iterate over each order and populate the table rows
    totalorder.forEach(order => {
        html += `
                <tr>
                    <td>${order.Name}, ${order.Address}<br>${order.Number}</td>
                    <td>${order.date}</td>
                    <td>${order.Paymentmethod}</td>
                    <td>${order.totalamount}</td>
                </tr>`;
    });

    // Close the HTML content
    html += `
            </tbody>
        </table>
    </div>
</body>
</html>`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Configure page and generate PDF
    await page.setContent(html); // Set your HTML content here
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Send the PDF as a response
    res.contentType("application/pdf");
    res.send(pdfBuffer);

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/usermanagement",(req,res)=>{
  producthelper.findalluser().then((totaluser)=>{
    if(totaluser==0){
      res.render("admin/usermanagement",{admin:true,usernotfound:true})
    }else{
       res.render("admin/usermanagement",{admin:true,totaluser})
    }
   
  })

})

router.get("/blockuser/:id",(req,res)=>{
  producthelper.blockuser(req.params.id).then(()=>{
    res.redirect('/admin/usermanagement')

  })
})


router.post("/updatestatus",(req,res)=>{
  console.log(req.body.id)
  console.log(req.body.value)
  producthelper.updatestatus(req.body.id,req.body.value).then(()=>{
    res.json({response})
  })
})

const intervalId = setInterval(() => {
  producthelper.couponcalling();
}, 300000);

module.exports = router;


