#### Metsahaldur backend
---

1) navigeeri host-arvutis mets/www kausta

2) `sudo git clone https://KASUTAJANIMI@github.com/vlasn/mets-be be`

3) `sudo npm install`

4) `sudo npm i -G nodemon` - quality of life improvement, soovitan!

5) `nodemon server.js` või `node server`

6) navigeeri brauseris localhost:3000/api, proovi /api/user, /api/user/dog

VM-is käivitamiseks liigu enne viiendat sammu virtuaalmasinas be kausta ja jooksuta 5. käsk seal.
Õige serverikonfi korral peaks tulem olema kättesaadav localhost:3080/api pealt.
