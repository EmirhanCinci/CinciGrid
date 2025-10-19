# CinciGrid

## Genel Bakış
CinciGrid, jQuery tabanlı, esnek ve zincirleme çağrılarla yapılandırılabilen bir tablo bileşenidir. Render süreciyle birlikte başlık, gövde, altlık ve sayfalama gibi bileşenleri dinamik olarak oluşturur; admin panelleri ve CRUD tabanlı arayüzlerde modern veri tablo ihtiyaçlarını karşılamak için tasarlanmıştır.

## Kurucu ve Başlangıç Durumu
- **constructor**: Geliştiricinin sağladığı seçiciyi jQuery nesnesine dönüştürür. Seçici ile eşleşen bir öğe bulunamazsa hata fırlatır.
- İçsel durum nesnesi, tablo element referansları (`tableElement`, `paginationElement` vb.), veri deposu, sayfalama, seçim, arama gibi tüm konfigürasyon bayraklarını varsayılan değerlerle oluşturur.

## Veri Yönetimi Metotları
- `setData(data: Array<object>)`: Tabloya yeni veri kümesi bağlar, toplam kayıt sayısını günceller. Zincirleme kullanım destekler.
- `clearData()`: Veri kümesini temizler ve toplam kayıt sayısını sıfırlar.
- `getTotalCount()`: İçsel toplam kayıt sayısını döner.
- `getSelectedRows()`: Seçili satırları dış dünyaya aktarır.

## Görünüm ve Kimlik Ayarları
- `setTableId(id: string)`: Tablo elementinin `id` değerini ayarlar, render edilmişse DOM'a anında işler.
- `setTableClass(className: string)`, `addTableClass(className: string)`, `removeTableClass(className: string)`: Tabloya sınıf yönetimi ekler.
- `setTitle(title: string)`, `clearTitle()`: Tablo başlığını yönetir.
- `enablePagination(enable: boolean)`, `setPageSize(size: number)`: Sayfalama davranışını kontrol eder.
- `enableRowNumbers(enable: boolean)`, `enableRowSelection(enable: boolean)`: Satır numarası ve seçim mekanizmasını etkinleştirir.
- `setHeaderContainerStyle(style: object)`, `setFooterContainerStyle(style: object)`: Header ve footer kapsayıcılarına inline stil uygular.

## Sütun ve Aksiyon Tanımlama
- `setColumn(key: string, options: ColumnOptions)`: Sütun başlık metni, hizalama, filtre/sıralama/arama seçenekleri, özel formatter ve toplama fonksiyonlarını içerir.
- `addActionColumn(options: ActionColumnOptions)`: Satır bazlı aksiyon butonları (örneğin düzenle veya sil) tanımlar. Asenkron `onClick` desteği verir ve buton durumunu otomatik yönetir.

## Arama, Filtreleme ve Sıralama
- `enableGlobalSearch(enable: boolean)`, `setGlobalSearchPlaceholder(text: string)`: Global arama kutusunu yönetir.
- Kolon bazlı aramalar `columnSearches` sözlüğüyle takip edilir. Her hücre için aranabilir metin `#getCellSearchableText` ile, formatter veya `searchSource` önceliği gözetilerek hazırlanır.
- İçsel metotlar sırasıyla veri kümesini daraltır:
  - `#applyGlobalSearch`
  - `#applyColumnSearches`
  - `#applyActiveFilters`
  - `#applySorting`
  - `#applyPagination`
- Filtre ikonları dropdown menüler üretir; "Tümünü Seç" ve canlı arama desteği sunar. Seçimler `activeFilters` üzerinden yönetilir.

## Footer, Toplamalar ve Sayfalama
- `enableTotalCountInfoMode(enable: boolean)`: Alt alanda toplam kayıt bilgisini gösterir. Metin `#builInfo` ile "Toplam X kayıttan..." formatında oluşturulur.
- `#buildPagination()`: İlk/önceki/sonraki/son düğmelerini ve sayfa numaralarını üretir. Tıklamalar sayfa indeksini güncelleyip tabloyu yeniden oluşturur.
- Footer toplama satırı yalnızca `aggregate` tanımlı sütunlar için oluşur ve filtre/arama sonrası görünür veriye göre (sum/avg/count veya özel fonksiyon) hesaplama yapar.

## Render Süreci
- `render()`: `<table>` iskeletini kurar (`#buildHeader`, `#buildBody`, `#buildFooter`) ve kapsayıcıyı temizleyip header kontrollerini (başlık, global arama, reset, seçim bilgisi) ekler.
- Reset butonu, filtre/arama/sıralama/sayfa durumunu varsayılana döndürür ve tabloyu yeniden oluşturur.

## Geliştiriciler İçin README Kullanımı
- Bu README, CinciGrid'in kapsamını ve çözmeyi amaçladığı problemleri özetler. Yeni geliştiricilere bileşenin API yüzeyini ve tablo ihtiyaçlarını nasıl karşıladığını hızlıca anlatır.
- Projeye dahil olurken, burada listelenen metot referanslarından yararlanarak tabloyu özelleştirebilir, gerekirse aşağıdaki örnek akışı takip ederek hızlıca başlangıç yapabilirsiniz.

## Örnek Kullanım Akışı
1. DOM'da bir konteyner oluşturun: `<div id="grid"></div>`
2. Grid'i başlatın:
   ```js
   const grid = new CinciGrid('#grid');
   ```
3. Sütunları tanımlayın:
   ```js
   grid
     .setColumn('name', { label: 'Ad', sortable: true, searchable: true })
     .setColumn('age', {
       label: 'Yaş',
       contentAlign: 'text-center',
       aggregate: 'avg',
       aggregateLabel: 'Ortalama Yaş'
     })
     .addActionColumn({
       label: 'Sil',
       class: 'btn btn-sm btn-danger',
       onClick: row => deleteUser(row.id)
     });
   ```
4. Veriyi bağlayın ve özellikleri etkinleştirin:
   ```js
   grid
     .setData(users)
     .enablePagination(true)
     .setPageSize(20)
     .enableGlobalSearch(true)
     .enableRowSelection(true)
     .setTitle('Kullanıcı Listesi')
     .render();
   ```

Bu adımlar, CinciGrid bileşenini projeye entegre ederken izlemeniz gereken ana süreci örneklendirir.