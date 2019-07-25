pico-8 cartridge // http://www.pico-8.com
version 18
__lua__
// gpio array
data={0,0,0,0,0,0,0,0}
// init des binaerstrings
gpiostring=""
// init des dezimalen werts
dec=0

function _update()
 // "0b" prefix zum deinieren des binaeren inhalts
 gpiostring="0b"
 // auslesen der mqtt info von den gpio pins
 mqttdata()
 // anzeige löschen
 cls(0)
 // binaeren string ausgeben
 print("bin: "..tostr(gpiostring))
 // binaeren string nach dezimal konvertieren
 dec=tonum(gpiostring)
 // dezimalen wert ausgeben
 print("dez: "..tostr(dec))
end

function mqttdata()
// gpio speicheradressen mit peek auslesen
 for i=0,7 do
  gpioval = peek(0x5f80 + i)
  print(gpioval)
  // High(255) zu 1 ändern und an string anhaengen
  if (gpioval == 255) then data[i+1] = 1 else data[i+1] = 0 end
  gpiostring=gpiostring..tostr(data[i+1])
 end
end