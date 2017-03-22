####Metsahaldur backend
---

1) navigeeri host-arvutis mets/www kausta

2) `sudo git clone https://KASUTAJANIMI@github.com/vlasn/mets-be be`

3) `sudo npm install`

5) `nodemon server.js`(kui nodemon on installitud) või `node server`

6) navigeeri brauseris localhost:3000/api, proovi /api/user, /api/user/dog

VM-is käivitamiseks liigu enne viiendat sammu virtuaalmasinas be kausta ja jooksuta 5. käsk seal.
Õige serverikonfi korral peaks tulem olema kättesaadav localhost:3080/api pealt.