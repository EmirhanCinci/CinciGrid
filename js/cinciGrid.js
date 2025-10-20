/**
 * CinciGrid – jQuery tabanlı, esnek ve güçlü bir tablo (data grid) bileşeni.
 * 
 * Özellikler:
 * - Dinamik veri yönetimi
 * - Filtreleme, sıralama, sayfalama
 * - Kolon bazlı arama ve toplama işlemleri
 * - Geliştirici dostu API tasarımı
 * 
 * @author  CİNCİ
 * @version 1.0.0
 * @license MIT
 */

export default class CinciGrid {
    /**
     * @constructor
     * @param {string|HTMLElement|jQuery} selector - Tablo bileşeninin bağlanacağı HTML öğesi veya jQuery seçicisi.
     * 
     * @throws {Error} Geçersiz veya bulunamayan selector parametresi durumunda hata fırlatır.
     */
    constructor(selector) {
        this.selector = selector instanceof jQuery ? selector : $(selector);
        if (!this.selector || this.selector.length === 0) {
            throw new Error("CinciGrid: Geçersiz selector. Eleman bulunamadı.");
        }

        /**
         * Tablo HTML elementini temsil eder.  
         * `render()` çağrıldığında dinamik olarak oluşturulur ve DOM’a eklenir.
         *
         * @type {jQuery|null}
         * @default null
         * @description
         * Bu özellik tabloya ait `<table>` elementinin jQuery nesnesini saklar.  
         * Geliştirici tablo oluşturulduktan sonra doğrudan erişim veya özelleştirme yapmak isterse kullanabilir.
         *
         * @example
         * grid.render();
         * console.log(grid.tableElement); // Oluşturulan tabloya ait jQuery nesnesi
         */
        this.tableElement = null;

        /**
         * Tabloya bağlı veri kümesi.
         * 
         * @type {Array<Object>}
         * @default []
         * @description Tabloda gösterilecek ham verileri içerir. 
         * Geliştirici `setData()` metodu ile dışarıdan atama yapabilir.
         */
        this.data = [];

        /**
         * Toplam kayıt sayısı.
         * 
         * @type {number}
         * @default 0
         * @description Tabloya yüklenen toplam satır sayısını tutar. 
         * Sayfalama ve toplam bilgi gösteriminde kullanılır.
         */
        this.totalCount = 0;

        /**
         * Tabloya atanacak benzersiz HTML kimliği (id).
         * 
         * @type {string}
         * @default ""
         * @description Geliştirici tabloya özel bir `id` değeri tanımlayabilir.
         * Bu değer DOM işlemleri veya CSS stillendirmesi için kullanılabilir.
         * 
         * @example
         * grid.setTableId("kullaniciListesi");
         */
        this.tableId = "";

        /**
         * Tabloya eklenecek CSS sınıflarını tutar.
         * 
         * @type {string}
         * @default ""
         * @description Tabloya bir veya birden fazla özel CSS sınıfı atanabilir. 
         * Bu sayede tabloya tematik veya proje bazlı stiller uygulanabilir.
         * 
         * @example
         * grid.setTableClass("table table-striped table-hover");
         */
        this.tableClasses = "table table-striped table-bordered table-hover";

        /**
         * Tablo başlığının gösterilip gösterilmeyeceğini belirler.
         *
         * @type {boolean}
         * @default false
         * @description `true` olduğunda tablo başlığı (title) ekranda görüntülenir.  
         * Geliştirici `setTitle()` metodu ile başlığı tanımlayabilir.
         */
        this.showTitle = false;

        /**
         * Tablo başlık metnini tutar.
         *
         * @type {string}
         * @default ""
         * @description `showTitle` değeri `true` olduğunda, bu metin tablo başlığı olarak görünür.  
         * `clearTitle()` metodu ile sıfırlanabilir.
         */
        this.tableTitle = "";

        /**
         * Sayfalama (pagination) özelliğinin aktif olup olmadığını belirtir.
         *
         * @type {boolean}
         * @default false
         * @description `true` olduğunda tablo verileri sayfalara bölünerek gösterilir.  
         * `enablePagination(true)` metodu ile etkinleştirilebilir.
         */
        this.usePagination = false;

        /**
         * Sayfalama bileşenine (pagination UI) ait jQuery nesnesini tutar.
         *
         * @type {jQuery|null}
         * @default null
         * @description `render()` çağrıldığında, sayfalama kontrolleri oluşturulursa bu değişkende saklanır.  
         * Geliştirici gerektiğinde özelleştirme yapmak için erişebilir.
         */
        this.paginationElement = null;

        /**
         * Mevcut sayfa indeksini belirtir.
         *
         * @type {number}
         * @default 1
         * @description
         * 1 tablonun ilk sayfasını temsil eder.  
         * Sayfa geçişlerinde bu değer güncellenir ve `render()` yeniden çalıştırılır.
         */
        this.index = 1;

        /**
         * Her sayfada gösterilecek satır (kayıt) sayısını belirtir.
         *
         * @type {number}
         * @default 10
         * @description
         * `setPageSize()` metodu ile değiştirilebilir.  
         * Sayfalama aktifse, bu değer tablo performansını ve görünümünü doğrudan etkiler.
         *
         * @example
         * grid.setPageSize(25); // her sayfada 25 kayıt göster
         */
        this.pageSize = 10;

        /**
         * Son render işleminde görüntülenen satırların referanslarını saklar.
         * "Tümünü Seç" işlemleri yalnızca bu görünür satırlar üzerinde çalışacaktır.
         *
         * @type {Array<Object>}
         * @private
         */
        this._currentViewData = [];

        /**
         * Son render işleminde görüntülenen satırların, orijinal veri dizisindeki indeksleri.
         * Satır seçimi durumunu güncellerken filtrelenmiş verilerle senkron kalmayı sağlar.
         *
         * @type {Array<number>}
         * @private
         */
        this._currentViewIndices = [];

        /**
         * Satır numaralarının tabloda gösterilip gösterilmeyeceğini belirten bayrak.
         * false olduğunda tablo satırlarının başında sıra numarası görünmez.
         * 
         * @type {boolean}
         * @default false
         */
        this.showRowNumbers = false;

        /**
         * Satır seçim özelliğinin aktif olup olmadığını belirten bayrak.
         * false olduğunda tablo satırlarının solunda seçim kutucukları (checkbox) gösterilmez.
         * 
         * @type {boolean}
         * @default false
         */
        this.enableSelection = false;

        /**
         * Seçili satırların indekslerini tutan küme (Set).
         * Her seçim değişikliğinde güncellenir.
         * 
         * @type {Set<number>}
         * @default new Set()
         */
        this.selectedRows = new Set();

        /**
         * @property {boolean} enableGlobalSearchBar
         * @description Tablonun üst kısmında genel arama (global search) alanının gösterilip gösterilmeyeceğini belirten bayrak.
         * `false` olduğunda arama alanı gizlenir.
         * 
         * @default false
         */
        this.enableGlobalSearchBar = false;

        /**
         * @property {string} globalSearch
         * @description Genel arama kutusuna yazılan son arama terimini saklar.
         * Bu değer, tabloyu filtrelerken kullanılır.
         * 
         * @default ""
         */
        this.globalSearch = "";

        /**
         * @property {string} globalSearchPlaceholder
         * @description Genel arama kutusunda görünecek placeholder metnini belirler.
         * 
         * @default "Tabloda ara..."
         */
        this.globalSearchPlaceholder = "Tabloda ara...";

        /**
         * @property {Object<string, Object>} columnSettings
         * @description Tabloda görüntülenecek sütunların yapılandırma (ayar) nesnelerini tutar.  
         * Her bir sütun `key` adıyla tanımlanır ve görünüm, hizalama, filtreleme, sıralama, biçimlendirme gibi özellikleri içerir.
         *
         * @example
         * grid.columnSettings = {
         *   name: { label: "Ad", sortable: true, searchable: true },
         *   age: { label: "Yaş", contentAlign: "text-center" }
         * };
         */
        this.columnSettings = {};

        /**
         * @property {Array<Object>} actionColumns
         * @description Her satırda görünecek olan işlem (aksiyon) butonlarını tutar.  
         * Bu butonlar genellikle "Düzenle", "Sil", "Detay" gibi eylemler için kullanılır.
         *
         * @example
         * grid.actionColumns = [
         *   { label: "Sil", icon: "fa fa-trash", className: "btn btn-danger", onClick: (row) => deleteRow(row.id) },
         *   { label: "Düzenle", icon: "fa fa-edit", className: "btn btn-warning", onClick: (row) => editRow(row.id) }
         * ];
         */
        this.actionColumns = [];

        /**
         * @property {string} headerContainerStyle
         * @description Tablo üst (header) kontrol alanının özel CSS stillerini tanımlar.  
         * Geliştirici, tablo başlığı veya global arama alanının bulunduğu konteynerin görünümünü özelleştirebilir.
         *
         * @example
         * grid.headerContainerStyle = "background-color: #f8f9fa; border-radius: 8px;";
         */
        this.headerContainerStyle = "background-color: lightblue;";

        /**
         * @property {string} footerContainerStyle
         * @description Tablo alt (footer) kontrol alanının özel CSS stillerini tanımlar.  
         * Genellikle sayfalama ve toplam bilgi alanının stilini değiştirmek için kullanılır.
         *
         * @example
         * grid.footerContainerStyle = "background-color: #fff; border-top: 1px solid #ddd;";
         */
        this.footerContainerStyle = "background-color: lightblue;";

        /**
         * @property {boolean} totalCountInfo
         * @description Toplam kayıt bilgisinin tablo alt kısmında gösterilip gösterilmeyeceğini belirler.  
         * `true` olduğunda, sayfalama alanının sol tarafında "Toplam X kayıttan Y tanesi gösteriliyor" gibi bir bilgi görünür.
         *
         * @default false
         *
         * @example
         * grid.totalCountInfo = true; // Toplam kayıt bilgisi etkin
         */
        this.totalCountInfo = false;

        /**
         * @property {string|null} sortKey
         * @description Hangi sütun üzerinde sıralama yapıldığını belirtir.  
         * `null` değeri, sıralamanın devre dışı olduğunu gösterir.
         *
         * @default null
         * @example
         * grid.sortKey = "price"; // "price" sütununa göre sıralama yapar.
         */
        this.sortKey = null;

        /**
         * @property {"asc"|"desc"} sortOrder
         * @description Geçerli sıralama yönünü belirtir.  
         * "asc" → artan, "desc" → azalan sıralama.
         *
         * @default "asc"
         * @example
         * grid.sortOrder = "desc"; // Azalan sıralama uygular.
         */
        this.sortOrder = "asc";

        /**
         * @property {Object<string, Array<any>>} activeFilters
         * @description Her sütun için aktif durumda olan filtre değerlerini tutar.  
         * Anahtar sütun adıdır, değer o sütunda seçili filtrelerin listesidir.
         *
         * @default {}
         * @example
         * grid.activeFilters = { status: ["Aktif", "Pasif"] };
         */
        this.activeFilters = {};

        /**
         * @property {Object<string, string>} columnSearches
         * @description Kolon bazlı arama ifadelerini saklar.  
         * Anahtar sütun adıdır, değer arama kutusuna girilen metindir.
         *
         * @default {}
         * @example
         * grid.columnSearches = { name: "Ali", city: "Ankara" };
         */
        this.columnSearches = {};
    }

    /**
     * @private
     * @method #updateCount
     * @description Toplam kayıt sayısını (`totalCount`) günceller.
     * Veri setinde yapılan değişikliklerden sonra otomatik olarak çağrılır.
     */
    #updateCount() {
        this.totalCount = this.data.length;
    }

    /**
     * Toplam kayıt sayısını döner.
     * 
     * @method getTotalCount
     * @returns {number} Tabloya ait toplam veri (kayıt) sayısını döner.
     *
     * @example
     * const total = grid.getTotalCount();
     * console.log(`Toplam ${total} kayıt var.`);
     */
    getTotalCount() {
        return this.totalCount;
    }

    /**
     * Yeni veri kümesini tabloya atar.
     * 
     * @param {Array<Object>} data - Gösterilecek veri kümesi (her satır bir nesne olarak temsil edilir).
     * @throws {Error} Eğer parametre bir dizi değilse hata fırlatır.
     * 
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     * 
     * @example
     * grid.setData([{ ad: "Ali", yas: 25 }, { ad: "Ayşe", yas: 30 }]);
     */
    setData(data) {
        if (!Array.isArray(data)) throw new Error("CinciGrid: Data bir dizi olmalı.");
        this.data = data;
        this.#updateCount();
        return this;
    }

    /**
     * Tablodaki tüm verileri temizler.  
     * Data dizisini sıfırlar ve toplam kayıt sayısını günceller.
     *
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.clearData(); // Tüm tablo içeriğini temizler
     */
    clearData() {
        this.data = [];
        this.#updateCount();
        return this;
    }

    /**
     * Tabloya benzersiz bir HTML kimliği (id) atar.
     *
     * @param {string} id - Tablonun kimliği. Boş olmamalıdır.
     * @throws {Error} Eğer değer geçerli bir string değilse hata fırlatır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setTableId("kullaniciTablosu");
     */
    setTableId(id) {
        if (typeof id !== "string" || id.trim() === "")
            throw new Error("CinciGrid: ID değeri geçerli bir string olmalı.");
        this.tableId = id.trim();
        if (this.tableElement) this.tableElement.attr("id", this.tableId);
        return this;
    }

    /**
     * Tabloya özel CSS sınıfları atar.
     *
     * @param {string} classes - Uygulanacak CSS sınıf(lar)ı. 
     * Boşlukla ayrılmış birden fazla sınıf verilebilir.
     * @throws {Error} Eğer parametre geçerli bir string değilse hata fırlatır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setTableClass("table table-striped table-hover");
     */
    setTableClass(classes) {
        if (typeof classes !== "string")
            throw new Error("CinciGrid: classes değeri geçerli bir string olmalı.");
        this.tableClasses = classes.trim();
        if (this.tableElement) this.tableElement.removeClass().addClass("cinci-grid " + this.tableClasses);
        return this;
    }

    /**
     * Tabloya yeni CSS sınıfları ekler.
     *
     * @param {string} classes - Eklenecek sınıf(lar). Boşlukla ayrılmış birden fazla değer olabilir.
     * @throws {Error} Eğer parametre geçerli bir string değilse hata fırlatır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.addTableClass("table-bordered bg-light");
     */
    addTableClass(classes) {
        if (typeof classes !== "string")
            throw new Error("CinciGrid: classes değeri geçerli bir string olmalı.");
        const newClasses = classes.trim().split(/\s+/);
        const existing = this.tableClasses.split(/\s+/).filter(Boolean);
        newClasses.forEach(cls => { if (!existing.includes(cls)) existing.push(cls); });
        this.tableClasses = existing.join(" ");
        if (this.tableElement) this.tableElement.addClass(classes);
        return this;
    }

    /**
     * Tabloya atanmış belirli CSS sınıflarını kaldırır.
     *
     * @param {string} classes - Kaldırılacak sınıf(lar). Boşlukla ayrılmış olabilir.
     * @throws {Error} Eğer parametre geçerli bir string değilse hata fırlatır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.removeTableClass("table-hover bg-light");
     */
    removeTableClass(classes) {
        if (typeof classes !== "string")
            throw new Error("CinciGrid: classes değeri geçerli bir string olmalı.");
        const removeClasses = classes.trim().split(/\s+/);
        const existing = this.tableClasses.split(/\s+/).filter(Boolean);
        this.tableClasses = existing.filter(cls => !removeClasses.includes(cls)).join(" ");
        if (this.tableElement) this.tableElement.removeClass(classes);
        return this;
    }

    /**
     * Tabloya bir başlık (title) atar.
     *
     * @param {string} title - Görüntülenecek tablo başlığı.
     * @throws {Error} Eğer değer geçerli bir string değilse hata fırlatır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setTitle("Kullanıcı Listesi");
     */
    setTitle(title) {
        if (typeof title !== "string")
            throw new Error("CinciGrid: title değeri geçerli bir string olmalı.");
        this.tableTitle = title.trim();
        this.showTitle = true;
        if (this.tableElement) {
            const tableTitle = this.selector.find('.table-title');
            console.log(tableTitle);
            tableTitle.text(this.tableTitle);
        }
        return this;
    }

    /**
     * Tablo başlığını kaldırır ve gizler.
     *
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.clearTitle();
     */
    clearTitle() {
        this.tableTitle = "";
        this.showTitle = false;
        return this;
    }

    /**
     * Sayfalama özelliğini aktif veya pasif hale getirir.
     *
     * @param {boolean} [enabled=true] - Sayfalamanın aktif olup olmayacağını belirler.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.enablePagination(true);  // Sayfalama aktif
     * grid.enablePagination(false); // Sayfalama kapalı
     */
    enablePagination(enabled = true) {
        this.usePagination = enabled;
        return this;
    }

    /**
     * Toplam sayfa sayısını hesaplar.
     *
     * @private
     * @returns {number} Toplam sayfa sayısı (en az 1 olacak şekilde).
     * @description
     * `totalCount` ve `pageSize` değerlerine göre sayfa sayısını döner.
     * Eğer kayıt yoksa bile en az 1 döner.
     */
    #getTotalPages() {
        return Math.ceil(this.totalCount / this.pageSize) || 1;
    }

    /**
     * Her sayfada görüntülenecek kayıt sayısını ayarlar.
     *
     * @param {number} size - Sayfa başına gösterilecek satır sayısı.
     * @throws {Error} Geçersiz veya 0'dan küçük bir değer verilirse hata fırlatır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner.
     *
     * @example
     * grid.setPageSize(20); // her sayfada 20 kayıt göster
     */
    setPageSize(size) {
        const num = parseInt(size);
        if (isNaN(num) || num <= 0) {
            throw new Error("CinciGrid: pageSize pozitif bir sayı olmalı.");
        }
        this.pageSize = num;
        this.index = 1;
        return this;
    }

    /**
     * Satır numaralarının tabloda gösterilip gösterilmeyeceğini ayarlar.
     *
     * @param {boolean} [enabled=true] - Satır numaralarının aktif edilip edilmeyeceğini belirtir.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.enableRowNumbers(true);  // Satır numaralarını göster
     * grid.enableRowNumbers(false); // Satır numaralarını gizle
     */
    enableRowNumbers(enabled = true) {
        this.showRowNumbers = enabled;
        return this;
    }

    /**
     * Tablo satırlarının seçilebilir olup olmadığını ayarlar.
     * 
     * @param {boolean} [enabled=true] - Satır seçimini aktif veya pasif eder.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.enableRowSelection(true);  // Satır seçimi aktif
     * grid.enableRowSelection(false); // Satır seçimi pasif ve tüm seçimler temizlenir
     */
    enableRowSelection(enabled = true) {
        this.enableSelection = enabled;
        if (!enabled) this.selectedRows.clear();
        return this;
    }

    /**
     * Seçili satırların verilerini döner.
     * 
     * @returns {Array<object>} Seçili satırlara karşılık gelen veri nesnelerinin dizisini döner.
     *
     * @example
     * const selected = grid.getSelectedRows();
     * console.log(selected);
     * [{ id: 1, name: "Ali" }, { id: 3, name: "Ayşe" }]
     */
    getSelectedRows() {
        return Array.from(this.selectedRows).map(i => this.data[i]);
    }

    /**
     * @method enableGlobalSearch
     * @description Genel arama (global search) özelliğini aktif veya pasif hale getirir.
     *
     * @param {boolean} [enabled=true] - Arama kutusunu etkinleştirir veya devre dışı bırakır.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.enableGlobalSearch(true);  // Arama kutusunu etkinleştir
     * grid.enableGlobalSearch(false); // Arama kutusunu gizle
     */
    enableGlobalSearch(enabled = true) {
        this.enableGlobalSearchBar = enabled;
        return this;
    }

    /**
     * @method setGlobalSearchPlaceholder
     * @description Genel arama kutusunun placeholder metnini değiştirir.
     *
     * @param {string} text - Arama kutusunda gösterilecek placeholder metni.
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setGlobalSearchPlaceholder("Kayıt ara...");
     */
    setGlobalSearchPlaceholder(text) {
        this.globalSearchPlaceholder = text;
        return this;
    }

    /**
     * @method setColumn
     * @description Yeni bir sütun ekler veya mevcut bir sütunun ayarlarını günceller.  
     * Her sütun için görünüm, sıralama, filtreleme, biçimlendirme gibi detaylı özellikler belirlenebilir.
     *
     * @param {string} key - Sütunun veri anahtarı (örneğin "name", "age").
     * @param {Object} settings - Sütun yapılandırma ayarlarını içeren nesne.
     * @param {string} [settings.label] - Sütunun başlık etiketi. Belirtilmezse `key` değeri kullanılır.
     * @param {string} [settings.headerAlign="text-start"] - Başlık hücresinin hizalaması (`text-start`, `text-center`, `text-end`).
     * @param {string} [settings.contentAlign="text-start"] - İçerik hücresinin hizalaması.
     * @param {boolean} [settings.sortable=false] - Sütunun sıralanabilir olup olmadığını belirler.
     * @param {boolean} [settings.visible=true] - Sütunun görünür olup olmadığını belirler.
     * @param {boolean} [settings.filterable=false] - Filtreleme özelliğini aktif eder.
     * @param {boolean} [settings.searchable=false] - Arama özelliğini aktif eder.
     * @param {Function} [settings.formatter] - Hücre içeriğini özel biçimlendirmeyle döndürmek için fonksiyon.
     * @param {Function|string} [settings.filterSource] - Filtre seçeneklerini veya hücrede kullanılacak değeri belirleyen kaynak.
     * @param {Function} [settings.searchSource] - Arama sırasında kullanılacak alternatif veri kaynağını döndürür.
     * @param {Function|string} [settings.sortSource] - Sıralamada kullanılacak alternatif veri kaynağını belirler.
     * @param {Function|string} [settings.contentStyle] - Hücreye özel CSS stilini belirleyen string veya fonksiyon.
     * @param {Function|string} [settings.cellClass] - Hücreye özel CSS sınıfını belirleyen string veya fonksiyon.
     * @param {string} [settings.aggregateLabel] - Footer’da gösterilecek toplama etiketi (örneğin “Toplam”).
     * @param {string|Function} [settings.aggregate] - Footer hesaplama türü (`sum`, `avg`, `count`) veya özel hesaplama fonksiyonu.
     * 
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setColumn("price", {
     *   label: "Fiyat",
     *   sortable: true,
     *   contentAlign: "text-end",
     *   formatter: row => `${row.price.toFixed(2)} ₺`
     * });
     */
    setColumn(key, settings) {
        if (typeof key !== "string" || key.trim() === "")
            throw new Error("CinciGrid: Sütun key geçerli bir string olmalı.");
        if (typeof settings !== "object" || settings === null || Array.isArray(settings))
            throw new Error("CinciGrid: Sütun ayarları geçerli bir obje olmalı.");

        const colSettings = {
            label: typeof settings.label === "string" ? settings.label : key,
            headerAlign: typeof settings.headerAlign === "string" ? settings.headerAlign : "text-start",
            contentAlign: typeof settings.contentAlign === "string" ? settings.contentAlign : "text-start",
            contentStyle: typeof settings.contentStyle === "function" ? settings.contentStyle : (typeof settings.contentStyle === "string" ? settings.contentStyle : ""),
            sortable: typeof settings.sortable === "boolean" ? settings.sortable : false,
            sortSource: typeof settings.sortSource === "function" ? settings.sortSource : (typeof settings.sortSource === "string" ? settings.sortSource : null),
            visible: typeof settings.visible === "boolean" ? settings.visible : true,
            cellClass: typeof settings.cellClass === "function" ? settings.cellClass : (typeof settings.cellClass === "string" ? settings.cellClass : ""),
            formatter: typeof settings.formatter === "function" ? settings.formatter : null,
            filterable: typeof settings.filterable === "boolean" ? settings.filterable : false,
            filterSource: typeof settings.filterSource === "function" ? settings.filterSource : (typeof settings.filterSource === "string" ? settings.filterSource : ""),
            aggregateLabel: typeof settings.aggregateLabel === "string" ? settings.aggregateLabel : "",
            aggregate: typeof settings.aggregate === "function" ? settings.aggregate : (typeof settings.aggregate === "string" ? settings.aggregate.toLowerCase() : null),
            searchable: typeof settings.searchable === "boolean" ? settings.searchable : false,
            searchSource: typeof settings.searchSource === "function" ? settings.searchSource : null,
        };
        this.columnSettings[key] = colSettings;
        return this;
    }

    /**
     * @method addActionColumn
     * @description Tablo satırlarına özel işlem butonları ekler.  
     * Her buton için bir etiket, isteğe bağlı simge ve tıklama olayı tanımlanabilir.
     *
     * @param {Object} action - Eklenecek butonun yapılandırma nesnesi.
     * @param {string} action.label - Buton üzerinde veya tooltip'te görüntülenecek etiket.
     * @param {string} [action.icon=""] - Font Awesome veya benzeri ikon sınıfı (örneğin `"fa fa-trash"`).
     * @param {string} [action.class="btn btn-sm btn-secondary"] - Butonun CSS sınıfı.
     * @param {Function} [action.onClick] - Butona tıklandığında çalışacak fonksiyon.  
     * Parametre olarak ilgili satırın verisi (`row`) gönderilir.
     *
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.addActionColumn({
     *   label: "Sil",
     *   icon: "fa fa-trash",
     *   class: "btn btn-sm btn-danger",
     *   onClick: (row) => alert(`${row.name} silinecek!`)
     * });
     */
    addActionColumn(action) {
        if (typeof action !== "object" || !action.label)
            throw new Error("CinciGrid: action parametresi geçerli bir nesne olmalı.");
        const { label, icon = "", class: className = "btn btn-sm btn-secondary", onClick } = action;
        this.actionColumns.push({ 
            label, 
            icon, 
            className, 
            onClick: typeof 
            onClick === "function" ? onClick : null 
        });
        return this;
    }

    /**
     * @private
     * @method #parseStyleString
     * @description Inline CSS stil metnini anahtar/değer çiftleri bulunan bir nesneye dönüştürür.
     *
     * @param {string} style - Örn. "background-color: red; color: white".
     * @returns {Object<string, string>} Stil özelliklerinin haritası.
     */
    #parseStyleString(style) {
        if (typeof style !== "string" || !style.trim()) return {};

        return style.split(";").map(rule => rule.trim()).filter(Boolean)
            .reduce((acc, rule) => {
                const [property, ...valueParts] = rule.split(":");
                if (!property || valueParts.length === 0) return acc;
                acc[property.trim()] = valueParts.join(":").trim();
                return acc;
            }, {});
    }

    /**
     * @private
     * @method #stringifyStyleObject
     * @description Stil nesnesini inline CSS metnine dönüştürür.
     *
     * @param {Object<string, string>} styleObject - Stil özelliklerinin bulunduğu nesne.
     * @returns {string} Inline CSS metni.
     */
    #stringifyStyleObject(styleObject) {
        return Object.entries(styleObject).map(([property, value]) => `${property}: ${value}`).join("; ");
    }

    /**
     * @private
     * @method #extractStyleKeys
     * @description Stil kaldırma işlemlerinde kullanılacak property isimlerini normalize eder.
     *
     * @param {string|string[]} properties - Kaldırılacak stil tanımı veya tanımları.
     * @returns {string[]} Normalize edilmiş property isimleri.
     */
    #extractStyleKeys(properties) {
        if (Array.isArray(properties)) {
            return properties.map(item => this.#extractStyleKeys(item)).flat();
        }

        if (typeof properties === "string") {
            const trimmed = properties.trim();
            if (!trimmed) return [];

            if (trimmed.includes(":")) {
                return Object.keys(this.#parseStyleString(trimmed));
            }

            return trimmed.split(",").map(part => part.trim()).filter(Boolean);
        }

        return [];
    }

    /**
     * @private
     * @method #updateContainerStyle
     * @description DOM üzerindeki container stilini günceller.
     *
     * @param {string} containerSelector - Güncellenecek container'ın seçicisi.
     * @param {string} style - Uygulanacak inline CSS.
     */
    #updateContainerStyle(containerSelector, style) {
        if (!this.tableElement) return;
        const container = this.selector.find(containerSelector);
        if (container.length) {
            container.attr("style", style);
        }
    }

    /**
     * @method setHeaderContainerStyle
     * @description Tablo başlığı (header) bölümüne özel inline CSS stilleri uygular.  
     * Bu metot, tablo başlığı ve kontrol alanlarının geliştirici tarafından özelleştirilmesini sağlar.
     *
     * @param {string} style - Uygulanacak CSS stil kuralları (örneğin `"background:#f8f9fa; border-radius:6px;"`).
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setHeaderContainerStyle("background:#f8f9fa; border-radius:8px;");
     */
    setHeaderContainerStyle(style) {
        if (typeof style !== "string")
            throw new Error("CinciGrid: headerContainer style bir string olmalı.");
        this.headerContainerStyle = style.trim();
        if (this.tableElement) this.#updateContainerStyle('.headerContainer', this.headerContainerStyle);
        return this;
    }

     /**
     * @method addHeaderContainerStyle
     * @description Mevcut header stiline yeni CSS kuralları ekler veya var olanları günceller.
     *
     * @param {string} style - Eklenecek inline CSS metni.
     * @returns {CinciGrid} Mevcut tablo örneği.
     */
    addHeaderContainerStyle(style) {
        if (typeof style !== "string")
            throw new Error("CinciGrid: headerContainer style bir string olmalı.");

        const currentStyles = this.#parseStyleString(this.headerContainerStyle);
        const newStyles = this.#parseStyleString(style);
        const mergedStyles = { ...currentStyles, ...newStyles };

        this.headerContainerStyle = this.#stringifyStyleObject(mergedStyles);
        this.#updateContainerStyle('.headerContainer', this.headerContainerStyle);
        return this;
    }

    /**
     * @method removeHeaderContainerStyle
     * @description Header stilinden belirtilen CSS özelliklerini kaldırır.
     *
     * @param {string|string[]} properties - Silinecek özellik isimleri veya inline CSS metni.
     * @returns {CinciGrid} Mevcut tablo örneği.
     */
    removeHeaderContainerStyle(properties) {
        const keys = this.#extractStyleKeys(properties);
        if (!keys.length) return this;

        const currentStyles = this.#parseStyleString(this.headerContainerStyle);
        keys.forEach(key => {
            if (key in currentStyles) delete currentStyles[key];
        });

        this.headerContainerStyle = this.#stringifyStyleObject(currentStyles);
        this.#updateContainerStyle('.headerContainer', this.headerContainerStyle);
        return this;
    }

    /**
     * @method setFooterContainerStyle
     * @description Tablo alt kısmına (footer) özel inline CSS stilleri uygular.  
     * Genellikle toplam kayıt bilgisi veya sayfalama alanını görsel olarak düzenlemek için kullanılır.
     *
     * @param {string} style - Uygulanacak CSS stil kuralları (örneğin `"border-top:1px solid #ccc; padding:4px;"`).
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.setFooterContainerStyle("border-top:1px solid #ccc; padding:4px;");
     */
    setFooterContainerStyle(style) {
        if (typeof style !== "string")
            throw new Error("CinciGrid: footerContainer style bir string olmalı.");
        this.footerContainerStyle = style.trim();
        if (this.tableElement) this.#updateContainerStyle('.footer-container', this.footerContainerStyle);
        return this;
    }

    /**
     * @method addFooterContainerStyle
     * @description Mevcut footer stiline yeni CSS kuralları ekler veya var olanları günceller.
     *
     * @param {string} style - Eklenecek inline CSS metni.
     * @returns {CinciGrid} Mevcut tablo örneği.
     */
    addFooterContainerStyle(style) {
        if (typeof style !== "string")
            throw new Error("CinciGrid: footerContainer style bir string olmalı.");

        const currentStyles = this.#parseStyleString(this.footerContainerStyle);
        const newStyles = this.#parseStyleString(style);
        const mergedStyles = { ...currentStyles, ...newStyles };

        this.footerContainerStyle = this.#stringifyStyleObject(mergedStyles);
        this.#updateContainerStyle('.footer-container', this.footerContainerStyle);
        return this;
    }

    /**
     * @method removeFooterContainerStyle
     * @description Footer stilinden belirtilen CSS özelliklerini kaldırır.
     *
     * @param {string|string[]} properties - Silinecek özellik isimleri veya inline CSS metni.
     * @returns {CinciGrid} Mevcut tablo örneği.
     */
    removeFooterContainerStyle(properties) {
        const keys = this.#extractStyleKeys(properties);
        if (!keys.length) return this;

        const currentStyles = this.#parseStyleString(this.footerContainerStyle);
        keys.forEach(key => {
            if (key in currentStyles) delete currentStyles[key];
        });

        this.footerContainerStyle = this.#stringifyStyleObject(currentStyles);
        this.#updateContainerStyle('.footer-container', this.footerContainerStyle);
        return this;
    }

    /**
     * @private
     * @method #updateSelectAllState
     * @description "Tümünü Seç" kutusunun durumunu (checked / unchecked) günceller.  
     * Eğer tabloda görüntülenen tüm satırlar seçilmişse checkbox otomatik olarak işaretlenir,  
     * aksi durumda kaldırılır. Bu metot her satır seçimi veya kaldırma işleminden sonra çağrılır.
     *
     * @example
     * Kullanıcı satır seçimlerini değiştirdiğinde otomatik olarak çağrılır.
     * this.#updateSelectAllState();
     */
    #updateSelectAllState() {
        const checkbox = this.selector.find(".select-all-checkbox");
        if (!checkbox.length) return;

        const visibleIndices = this._currentViewIndices || [];
        if (visibleIndices.length === 0) {
            checkbox.prop("checked", false);
            checkbox.prop("indeterminate", false);
            return;
        }

        const selectedCount = visibleIndices.filter(index => this.selectedRows.has(index)).length;
        const allSelected = selectedCount === visibleIndices.length;
        const partiallySelected = selectedCount > 0 && !allSelected;

        checkbox.prop("checked", allSelected);
        checkbox.prop("indeterminate", partiallySelected);
    }

    /**
     * @method enableTotalCountInfoMode
     * @description Toplam kayıt ve sayfalama bilgisini gösterme özelliğini aktif eder veya devre dışı bırakır.  
     * Bu bilgi, sayfalama kontrolünün yanında veya altında yer alabilir.
     *
     * @param {boolean} [enabled=true] - Özelliği etkinleştirir (`true`) veya devre dışı bırakır (`false`).
     * @returns {CinciGrid} Mevcut tablo örneğini döner (method chaining destekler).
     *
     * @example
     * grid.enableTotalCountInfoMode(true);  // Bilgilendirme alanını açar
     * grid.enableTotalCountInfoMode(false); // Bilgilendirme alanını kapatır
     */
    enableTotalCountInfoMode(enabled = true) {
        this.totalCountInfo = enabled;
        return this;
    }

    /**
     * @private
     * @method #getPagedData
     * @description Filtrelenmiş, sıralanmış ve sayfalanmış veri setini döner.  
     * Bu metod; global arama, kolon arama, filtreleme ve sıralama işlemlerini sırasıyla uygular.
     *
     * @returns {Array<Object>} Görüntülenecek veri dilimini döner.
     */
    #getPagedData() {
        let filteredData = [...this.data];
        filteredData = this.#applyGlobalSearch(filteredData);
        filteredData = this.#applyColumnSearches(filteredData);
        filteredData = this.#applyActiveFilters(filteredData);
        filteredData = this.#applySorting(filteredData);
        this.totalCount = filteredData.length;
        return this.#applyPagination(filteredData);
    }

    /**
     * @private
     * @method #getCellSearchableText
     * @description Belirtilen hücreden (satır ve sütun bazında) arama yapılabilir düz metin değeri döner.  
     * Bu metot, hem global arama hem de sütun bazlı arama işlemlerinde kullanılır.
     *
     * @param {object} row - Tablo satırını temsil eden veri nesnesi.
     * @param {string} key - Hücreye karşılık gelen sütun anahtarı.
     * @returns {string} Aranabilir düz metin değeri. Hücre değeri yoksa boş string döner.
     *
     * @example
     * const row = { name: "Ali", age: 25 };
     * const text = this.#getCellSearchableText(row, "name");
     * console.log(text); // "Ali"
     *
     * @details
     * - Eğer sütun `searchSource` fonksiyonu tanımlandıysa, onun döndürdüğü değer öncelikli olarak kullanılır.
     * - Eğer sütun `formatter` fonksiyonuna sahipse, HTML içeriği düz metne çevrilir ve o şekilde aranır.
     * - Yukarıdakiler tanımlı değilse doğrudan `row[key]` değeri kullanılır.
     * - `null` veya `undefined` değerler otomatik olarak boş stringe çevrilir.
     */
    #getCellSearchableText(row, key) {
        const col = this.columnSettings[key];
        if (!col) return "";
        if (typeof col.searchSource === "function") {
            const v = col.searchSource(row);
            return v == null ? "" : String(v);
        }
        if (typeof col.formatter === "function") {
            const html = col.formatter(row);
            const txt = $("<div>").html(html == null ? "" : String(html)).text();
            return txt;
        }
        const v = row[key];
        return v == null ? "" : String(v);
    }

    /**
     * @private
     * @method #applyGlobalSearch
     * @description Global arama alanındaki ifadeye göre tüm sütunlarda arama yapar.
     * @param {Array<Object>} data - Orijinal veri dizisi
     * @returns {Array<Object>} Filtrelenmiş veri dizisi
     */
    #applyGlobalSearch(data) {
        if (!this.globalSearch || !this.globalSearch.trim()) return data;
        const term = this.globalSearch.toLowerCase();

        return data.filter(row =>
            Object.keys(this.columnSettings).some(key => {
                const col = this.columnSettings[key];
                if (!col.visible) return false;
                const text = this.#getCellSearchableText(row, key).toLowerCase();
                return text.includes(term);
            })
        );
    }

    /**
     * @private
     * @method #applyColumnSearches
     * @description Kolon bazlı aramaları uygular.
     * @param {Array<Object>} data - Veri dizisi
     * @returns {Array<Object>} Filtrelenmiş veri dizisi
     */
    #applyColumnSearches(data) {
        if (!this.columnSearches || Object.keys(this.columnSearches).length === 0) return data;

        return data.filter(row =>
            Object.entries(this.columnSearches).every(([key, term]) => {
                if (!term) return true;
                const haystack = this.#getCellSearchableText(row, key).toLowerCase();
                return haystack.includes(String(term).toLowerCase());
            })
        );
    }

    /**
     * @private
     * @method #applyActiveFilters
     * @description Kullanıcı tarafından seçilen filtreleri uygular.
     * @param {Array<Object>} data - Veri dizisi
     * @returns {Array<Object>} Filtrelenmiş veri dizisi
     */
    #applyActiveFilters(data) {
        if (!this.activeFilters || Object.keys(this.activeFilters).length === 0) return data;

        return data.filter(row =>
            Object.entries(this.activeFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;
                const col = this.columnSettings[key];
                const cellValue = typeof col.filterSource === "function" ? col.filterSource(row) : row[key];
                return values.includes(cellValue);
            })
        );
    }

    /**
     * @private
     * @method #applySorting
     * @description Aktif sıralama (sortKey + sortOrder) bilgisine göre veriyi sıralar.
     * @param {Array<Object>} data - Filtrelenmiş veri dizisi
     * @returns {Array<Object>} Sıralanmış veri dizisi
     */
    #applySorting(data) {
        if (!this.sortKey) return data;
        const key = this.sortKey;
        const order = this.sortOrder;

        return [...data].sort((a, b) => {
            const valA = this.#getCellSortableValue(a, key);
            const valB = this.#getCellSortableValue(b, key);
            if (valA == null) return 1;
            if (valB == null) return -1;
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
        });
    }

    /**
     * @private
     * @method #getCellSortableValue
     * @description Sıralama işlemi için sütun değerini döner.
     * - Eğer `sortSource` fonksiyonu tanımlıysa öncelikli olarak o kullanılır.
     * - `sortSource` string ise satırdaki ilgili property değeri alınır.
     * - Aksi durumda `searchSource`, `filterSource` veya `formatter` sonuçları kullanılır.
     * - Hiçbiri tanımlı değilse doğrudan `row[key]` değeri döner.
     *
     * @param {object} row - Tablo satırını temsil eden veri nesnesi.
     * @param {string} key - Hücreye karşılık gelen sütun anahtarı.
     * @returns {*} Sıralamada kullanılacak değer.
     */
    #getCellSortableValue(row, key) {
        const col = this.columnSettings[key];
        if (!col) return row[key];

        if (typeof col.sortSource === "function") {
            return col.sortSource(row);
        }

        if (typeof col.sortSource === "string" && col.sortSource in row) {
            return row[col.sortSource];
        }

        if (typeof col.searchSource === "function") {
            return col.searchSource(row);
        }

        if (typeof col.filterSource === "function") {
            return col.filterSource(row);
        }

        if (typeof col.filterSource === "string" && col.filterSource in row) {
            return row[col.filterSource];
        }

        if (typeof col.formatter === "function") {
            const html = col.formatter(row);
            return $("<div>").html(html == null ? "" : String(html)).text();
        }

        return row[key];
    }

    /**
     * @private
     * @method #applyPagination
     * @description Sayfalama açık ise sadece ilgili sayfa dilimini döner.
     * @param {Array<Object>} data - Sıralanmış veri dizisi
     * @returns {Array<Object>} Görüntülenecek veri alt kümesi
     */
    #applyPagination(data) {
        if (!this.usePagination) return data;
        const start = (this.index - 1) * this.pageSize;
        const end = this.index * this.pageSize;
        return data.slice(start, end);
    }

    /**
     * @private
     * @method #buildFilterDropdown
     * @description Belirli bir sütun için dinamik filtre menüsü oluşturur.  
     * Kullanıcı sütun ikonuna (⛃) tıkladığında çağrılır ve filtre seçeneklerini listeler.
     *
     * @param {string} key - Filtre uygulanacak sütunun anahtarı.
     * @param {object} col - Sütun yapılandırma nesnesi (`columnSettings[key]`).
     * @returns {jQuery} jQuery ile oluşturulmuş filtre dropdown öğesi.
     *
     * @example
     * const dropdown = this.#buildFilterDropdown("status", this.columnSettings["status"]);
     * $("body").append(dropdown);
     *
     * @details
     * - Filtre menüsü sütun değerlerinden otomatik olarak oluşturulur.
     * - Eğer `col.filterSource` bir fonksiyon ise, her satırdan değer bu fonksiyonla alınır.
     * - Eğer `col.filterOptions` tanımlıysa, doğrudan o dizi kullanılır.
     * - “Tümünü Seç” seçeneği otomatik olarak eklenir.
     * - Arama kutusu, seçenekler arasında metin bazlı filtreleme yapar.
     * - Filtre değişiklikleri sonrası tablo `render()` ile yeniden oluşturulur.
     */
    #buildFilterDropdown(key, col) {
        const dropdown = $(`
            <div class="filter-dropdown shadow p-2 bg-white border rounded"
                style="position:absolute; z-index:9999; min-width:200px; max-height:300px; overflow:auto;">
            </div>
        `);

        const allValues =
            col.filterOptions && col.filterOptions.length
                ? col.filterOptions
                : [...new Set(
                    this.data.map(row => {
                        if (typeof col.filterSource === "function") return col.filterSource(row);
                        return row[key];
                    }).filter(Boolean)
                )];

        const selectedValues = this.activeFilters[key] || [];
        const selectAllId = `select_all_${key}`;

        dropdown.append(`<div class="mb-2"><input type="text" class="form-control form-control-sm filter-search" placeholder="Ara..."></div>`);

        dropdown.append(`
            <div class="form-check mb-1">
                <input type="checkbox" id="${selectAllId}" class="form-check-input"
                    ${selectedValues.length === allValues.length && allValues.length > 0 ? "checked" : ""}>
                <label for="${selectAllId}" class="form-check-label"><strong>Tümünü Seç</strong></label>
            </div>
        `);

        allValues.forEach(value => {
            const id = `filter_${key}_${value}`;
            const checked = selectedValues.includes(value) ? "checked" : "";
            dropdown.append(`
                <div class="form-check">
                    <input type="checkbox" id="${id}" class="form-check-input" value="${value}" ${checked}>
                    <label for="${id}" class="form-check-label">${value}</label>
                </div>
            `);
        });

        dropdown.find(".filter-search").on("input", (e) => {
            const term = e.target.value.toLowerCase();
            dropdown.find(".form-check").not(":first").each(function() {
                const label = $(this).text().toLowerCase();
                $(this).toggle(label.includes(term));
            });
        });

        dropdown.find(`#${selectAllId}`).on("change", (e) => {
            if (e.target.checked) {
                this.activeFilters[key] = [...allValues];
            } else {
                this.activeFilters[key] = [];
            }
            this.index = 1;
            this.render();
            dropdown.remove();
        });

        dropdown.find("input[type=checkbox]").not(`#${selectAllId}`).on("change", (e) => {
            const val = $(e.target).val();
            if (!this.activeFilters[key]) this.activeFilters[key] = [];

            if (e.target.checked) {
                if (!this.activeFilters[key].includes(val)) this.activeFilters[key].push(val);
            } else {
                this.activeFilters[key] = this.activeFilters[key].filter(v => v !== val);
            }

            const total = allValues.length;
            const selected = this.activeFilters[key].length;
            dropdown.find(`#${selectAllId}`).prop("checked", selected === total);

            this.index = 1;
            this.render();
        });

        return dropdown;
    }

    /**
     * @private
     * @method #buildFooterContainer
     * @description Tablonun alt kısmında (footer) sayfalama ve kayıt bilgisi alanını oluşturur.  
     * Eğer `usePagination` veya `totalCountInfo` özelliklerinden en az biri etkinse çalışır.  
     * Geliştirici isterse footer kısmını tamamen devre dışı bırakabilir.
     *
     * @returns {jQuery|null} jQuery ile oluşturulmuş footer kapsayıcısı döner.  
     * Her iki özellik de pasifse `null` döner.
     *
     * @example
     * // render() içinde otomatik olarak çağrılır:
     * const footer = this.#buildFooterContainer();
     * if (footer) this.selector.append(footer);
     *
     * @details
     * - Kapsayıcıda hem bilgi metni (`Toplam X kayıttan...`) hem de sayfa geçiş butonları bulunur.
     * - Geliştirici, dış görünümü `footerContainerStyle` özelliğiyle özelleştirebilir.
     * - Yalnızca `totalCountInfo` aktifse yalnız bilgi metni görüntülenir.
     * - Yalnızca `usePagination` aktifse yalnız sayfalama butonları görüntülenir.
     */
    #buildFooterContainer() {
        if (!this.usePagination && !this.totalCountInfo) return null;

        const footerContainer = $(
            `<div class="footer-container d-flex justify-content-between align-items-center py-3 px-2"
                style="${this.footerContainerStyle}">
            </div>`
        );

        const infoDiv = $('<div class="pagination-info small text-muted"></div>');
        const paginationDiv = $('<div class="pagination-container d-flex justify-content-end flex-grow-1"></div>');

        if (this.totalCountInfo) {
            const infoText = this.#builInfo();
            infoDiv.text(infoText);
        }
        footerContainer.append(infoDiv);

        if (this.usePagination) {
            const ul = this.#buildPagination();
            paginationDiv.append(ul);
        }
        footerContainer.append(paginationDiv);

        return footerContainer;
    }

    /**
     * @private
     * @method #builInfo
     * @description Aktif sayfa, toplam kayıt sayısı ve gösterilen aralığı içeren bilgi metnini üretir.  
     * Bilgi `Toplam X kayıttan Y tanesi gösteriliyor (Sayfa A/B)` formatında döner.
     *
     * @returns {string} Bilgi metni
     *
     * @example
     * const text = this.#builInfo();
     * console.log(text); // "Toplam 120 kayıttan 10 tanesi gösteriliyor (Sayfa 2/12)"
     */
    #builInfo() {
        const totalPages = this.#getTotalPages();
        const total = this.totalCount;
        const startIndex = (this.index - 1) * this.pageSize + 1;
        const endIndex = Math.min(startIndex + this.pageSize - 1, total);
        const infoText = `Toplam ${total} kayıttan ${endIndex - startIndex + 1} tanesi gösteriliyor (Sayfa ${this.index}/${totalPages}).`;
        return infoText;
    }

    /**
     * @private
     * @method #buildPagination
     * @description Sayfa geçiş butonlarını oluşturur.  
     * "İlk", "Önceki", "Sonraki" ve "Son" butonlarını içerir; ayrıca aktif sayfa vurgulanır.
     *
     * @returns {jQuery} jQuery ile oluşturulmuş `<ul>` elementini döner.
     *
     * @example
     * const pagination = this.#buildPagination();
     * $('.pagination-container').append(pagination);
     *
     * @details
     * - Her butonun tıklama olayı `render()` metodunu tetikler.
     * - Dinamik olarak aktif sayfa (`index`) ve toplam sayfa (`totalPages`) bilgisine göre güncellenir.
     * - Butonlar `page-item` ve `page-link` sınıflarıyla Bootstrap uyumludur.
     */
    #buildPagination() {
        const totalPages = this.#getTotalPages();
        const ul = $('<ul class="pagination mb-0"></ul>');

        const makeButton = (label, disabled, active, action) => {
            const li = $(`<li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}"></li>`);
            const btn = $(`<button class="page-link">${label}</button>`);
            if (!disabled) {
                btn.on("click", () => {
                    action();
                    this.render();
                });
            }
            li.append(btn);
            return li;
        };

        const current = this.index;
        ul.append(makeButton("« İlk", current === 1, false, () => (this.index = 1)));
        ul.append(makeButton("‹ Önceki", current === 1, false, () => (this.index -= 1)));

        const start = Math.max(1, current - 1);
        const end = Math.min(totalPages, start + 2);
        for (let i = start; i <= end; i++) {
            ul.append(makeButton(i, false, i === current, () => (this.index = i)));
        }

        ul.append(makeButton("Sonraki ›", current === totalPages, false, () => (this.index += 1)));
        ul.append(makeButton("Son »", current === totalPages, false, () => (this.index = totalPages)));

        return ul;
    }

    /**
     * @private
     * @method #buildHeader
     * @description Tablo başlığını (`<thead>`) oluşturur.  
     * Seçim kutusu, satır numarası, sütun başlıkları ve işlem sütunlarını dinamik olarak ekler.
     *
     * @returns {jQuery} Tamamlanmış `<thead>` elementi.
     */
    #buildHeader(currentViewIndices = []) {
        const thead = $(`<thead></thead>`);
        const theadRow = $(`<tr></tr>`);

        if (this.enableSelection) {
            const selectAllTh = this.#buildHeaderSelection(currentViewIndices);
            theadRow.append(selectAllTh);
        }

        if (this.showRowNumbers) {
            const rowNumbersTh = this.#buildHeaderRowNumbers();
            theadRow.append(rowNumbersTh);
        }

        for (const key in this.columnSettings) {
            const propertyColumn = this.#buildHeaderPropertyColumn(key);
            theadRow.append(propertyColumn);
        }

        if (this.actionColumns.length > 0) {
            const actionTh = this.#buildHeaderActionColumn();
            theadRow.append(actionTh);
        }

        thead.append(theadRow);
        this._lastColumnCount = theadRow.find("th").length;
        return thead;
    }

    /**
     * @private
     * @method #buildHeaderSelection
     * @description Tablonun en solunda bulunan “Tümünü Seç” kutusunu oluşturur.  
     * Kullanıcı bu kutuyu işaretlediğinde tüm satırlar seçilir veya temizlenir.
     *
     * @returns {jQuery} Seçim kutusunu içeren `<th>` elementi.
     */
    #buildHeaderSelection(currentViewIndices = []) {
        const selectedCount = currentViewIndices.filter(index => this.selectedRows.has(index)).length;
        const allSelected = currentViewIndices.length > 0 && selectedCount === currentViewIndices.length;
        const partiallySelected = selectedCount > 0 && !allSelected;
        const selectAllTh = $(`
            <th class="text-center" style="width:40px;">
                <input type="checkbox" class="select-all-checkbox">
            </th>
        `);
        const checkbox = selectAllTh.find("input");
        checkbox.prop("checked", allSelected);
        checkbox.prop("indeterminate", partiallySelected);
        checkbox.prop("disabled", currentViewIndices.length === 0);
        checkbox.on("change", (e) => {
            const checked = e.target.checked;
            const visibleIndices = Array.isArray(this._currentViewIndices) ? [...this._currentViewIndices] : [];

            if (checked) {
                visibleIndices.forEach(index => this.selectedRows.add(index));
            } else {
                visibleIndices.forEach(index => this.selectedRows.delete(index));
            }

            this.render();
        });
        return selectAllTh;
    }

    /**
     * @private
     * @method #buildHeaderRowNumbers
     * @description Satır numarası sütunu başlığını oluşturur.
     * @returns {string} `<th>` etiketi içeren HTML string.
     */
    #buildHeaderRowNumbers() {
        return `<th class="text-center" style="width:50px;">#</th>`;
    }

    /**
     * @private
     * @method #buildHeaderPropertyColumn
     * @description Her bir sütun için başlık hücresi oluşturur.  
     * Sıralama, filtreleme ve arama ikonlarını içerir.
     *
     * @param {string} key - Sütunun anahtar adı.
     * @returns {jQuery|null} Sütun başlığını temsil eden `<th>` elementi veya `null`.
     */
    #buildHeaderPropertyColumn(key) {
        const col = this.columnSettings[key];
        if (!col.visible) return null;
        const hasIcons = col.sortable || col.filterable || col.searchable;
        const appliedHeaderAlign = hasIcons ? "" : (col.headerAlign || "text-start");
        const th = $(`<th class="${appliedHeaderAlign}" style="position:relative;"></th>`);
        const inner = $(`
            <div class="th-inner d-flex align-items-center justify-content-between" 
                style="gap:4px; width:100%;">
                <span class="th-label text-truncate">${col.label || key}</span>
                ${hasIcons ? '<div class="icon-group d-flex align-items-center gap-1"></div>' : ''}
            </div>
        `);
        const iconGroup = inner.find(".icon-group");
        if (col.sortable) {
            const sortIcon = this.#buildSortIcon(key);
            iconGroup.append(sortIcon);
        }
        if (col.filterable) {
            const filterIcon = this.#buildFilterIcon(key, col);
            iconGroup.append(filterIcon);
        }
        if (col.searchable === true) {
            const searchIcon = this.#builSearchIcon(key, col, th, inner);
            iconGroup.append(searchIcon);
        }
        th.append(inner);
        return th;
    }

    /**
     * @private
     * @method #buildSortIcon
     * @description Belirli bir sütun için sıralama ikonunu oluşturur (▲▼).  
     * Sıralama durumu mevcutsa simge güncellenir.
     *
     * @param {string} key - Sıralama yapılacak sütun anahtarı.
     * @returns {jQuery} Sıralama ikonunu içeren `<span>` elementi.
     */
    #buildSortIcon(key) {
        const found = this.sortKey === key ? this.sortOrder : null;
        const sortIcon = $(`<span class="sort-icon" style="font-size:12px; opacity:${found ? 1 : 0.6}; cursor:pointer;">⇅</span>`);
        if (found === "asc") sortIcon.text("▲");
        else if (found === "desc") sortIcon.text("▼");
        sortIcon.on("click", (e) => {
            e.stopPropagation();
            if (this.sortKey === key) {
                if (this.sortOrder === "asc") this.sortOrder = "desc";
                else if (this.sortOrder === "desc") {
                    this.sortKey = null;
                    this.sortOrder = "asc";
                }
            } else {
                this.sortKey = key;
                this.sortOrder = "asc";
            }
            this.render();
        });
        return sortIcon;
    }

    /**
     * @private
     * @method #buildFilterIcon
     * @description Filtre ikonunu oluşturur (⛃).  
     * Tıklanınca filtre dropdown menüsü açar.
     *
     * @param {string} key - Filtre uygulanacak sütun anahtarı.
     * @param {object} col - Sütun ayarları.
     * @returns {jQuery} Filtre ikonunu içeren `<span>` elementi.
     */
    #buildFilterIcon(key, col) {
        const isFiltered = Array.isArray(this.activeFilters[key]) && this.activeFilters[key].length > 0;
        const filterIcon = $(`<span class="filter-icon" style="cursor:pointer; opacity:${isFiltered ? 1 : 0.6}; color:${isFiltered ? '#007bff' : 'inherit'};">⛃</span>`);
        filterIcon.on("click", (e) => {
            e.stopPropagation();
            $(".filter-dropdown").remove();
            const dropdown = this.#buildFilterDropdown(key, col);
            $("body").append(dropdown);
            const offset = filterIcon.offset();
            dropdown.css({
                top: offset.top + filterIcon.outerHeight(),
                left: offset.left - 10,
            });
            const closeDropdown = (event) => {
                if (!dropdown.is(event.target) && dropdown.has(event.target).length === 0) {
                    dropdown.remove();
                    $(document).off("click", closeDropdown);
                }
            };
            $(document).on("click", closeDropdown);
        });
        return filterIcon;
    }

    /**
     * @private
     * @method #builSearchIcon
     * @description Sütun bazlı arama simgesini oluşturur (🔍).  
     * Tıklanınca başlık üzerinde arama kutusu açar.
     *
     * @param {string} key - Arama yapılacak sütun anahtarı.
     * @param {object} col - Sütun yapılandırması.
     * @returns {jQuery} Arama ikonunu içeren `<span>` elementi.
     */
    #builSearchIcon(key, col, th, inner) {
        const hasSearch = this.columnSearches && this.columnSearches[key];
        const searchIcon = $(`<span class="search-icon" style="cursor:pointer; opacity:${hasSearch ? 1 : 0.6}; color:${hasSearch ? '#007bff' : 'inherit'};">🔍</span>`);
        searchIcon.on("click", (e) => {
            e.stopPropagation();
            const thWidth = th.outerWidth();
            inner.hide();
            const input = $(`<input type="text" class="form-control form-control-sm column-search-box" placeholder="${col.label || key} ara..." style="width:${thWidth}px; position:absolute; top:0; left:0; height:100%; font-size:13px; padding:2px 6px;">`);
            if (this.columnSearches[key]) input.val(this.columnSearches[key]);
            th.append(input);
            input.focus();
            input.on("keydown", (ev) => {
                if (ev.key === "Enter") {
                    const val = ev.target.value.trim();
                    if (val) this.columnSearches[key] = val;
                    else delete this.columnSearches[key];
                    this.index = 1;
                    this.render();
                } else if (ev.key === "Escape") {
                    input.remove();
                    inner.show();
                }
            });
            input.on("blur", () => {
                input.remove();
                inner.show();
            });
        });
        return searchIcon;
    }

    /**
     * @private
     * @method #buildHeaderActionColumn
     * @description Tablo işlem butonları için başlık hücresini oluşturur.
     * @returns {string} İşlemler başlığını içeren `<th>` HTML string.
     */
    #buildHeaderActionColumn() {
        return `<th class="text-center">İşlemler</th>`;
    }

    /**
     * @private
     * @method #buildBody
     * @description Tablo gövdesini (`<tbody>`) oluşturur.  
     * Satır seçimi, numaralandırma, sütun değerleri ve işlem butonlarını ekler.
     *
     * @returns {jQuery} Tamamlanmış `<tbody>` elementi.
     */
    #buildBody(pageData = null) {
        const tbody = $(`<tbody></tbody>`);
        const dataForRender = Array.isArray(pageData) ? pageData : this.#getPagedData();

        if (!Array.isArray(pageData)) {
            this._currentViewData = dataForRender;
            this._currentViewIndices = dataForRender.map(row => this.data.indexOf(row)).filter(index => index !== -1);
        }

        if (dataForRender.length === 0) {
            const totalColumns = this._lastColumnCount || Object.values(this.columnSettings).filter(c => c.visible !== false).length || 1;
            const tr = $('<tr></tr>');
            const td = $(`<td colspan="${totalColumns}" class="text-center">İçerik bulunamadı</td>`);
            tr.append(td);
            tbody.append(tr);
            return tbody;
        }

        dataForRender.forEach(row => {
            const tr = $(`<tr></tr>`);

            if (this.enableSelection) {
                const selectionTd = this.#buildBodySelection(row);
                tr.append(selectionTd);
            }

            if (this.showRowNumbers) {
                const rowNumberTd = this.#buildBodyRowNumbers(row, dataForRender);
                tr.append(rowNumberTd);
            }

            for (const key in this.columnSettings) {
                const col = this.columnSettings[key];
                if (!col.visible) continue;
                let value = row[key];
                if (typeof col.formatter === "function") {
                    value = col.formatter(row);
                }
                const cellClass = typeof col.cellClass === "function" ? col.cellClass(row) : col.cellClass || "";
                const inlineStyle = typeof col.contentStyle === "function" ? col.contentStyle(row) : col.contentStyle || "";
                const td = $(`<td class="${col.contentAlign || ''} ${cellClass || ''}" style="${inlineStyle}">${value || ''}</td>`);
                tr.append(td);
            }

            if (this.actionColumns.length > 0) {
                const actionTd = this.#buildBodyActionColumn(row);
                tr.append(actionTd);
            }

            tbody.append(tr);
        });

        return tbody;
    }

    /**
     * @private
     * @method #buildBodySelection
     * @description Her satır için seçim kutusunu oluşturur.  
     * Seçim durumu değiştiğinde `selectedRows` güncellenir.
     *
     * @param {object} row - İlgili satır verisi.
     * @returns {jQuery} Seçim kutusunu içeren `<td>` elementi.
     */
    #buildBodySelection(row) {
        const globalIndex = this.data.indexOf(row);
        const isChecked = this.selectedRows.has(globalIndex);

        const checkboxTd = $(`
            <td class="text-center">
                <input type="checkbox" class="row-checkbox" ${isChecked ? "checked" : ""}>
            </td>
        `);

        checkboxTd.find("input").on("change", (e) => {
            if (globalIndex === -1) return;
            if (e.target.checked) this.selectedRows.add(globalIndex);
            else this.selectedRows.delete(globalIndex);
            this.#updateSelectAllState();
            let info = this.selector.find('.selectedRowInfo');
            if (info.length === 0) {
                info = $('<span class="selectedRowInfo text-muted small ms-2"></span>');
                this.selector.find('.table-header-right').prepend(info);
            }
            if (this.selectedRows.size > 0) {
                info.text(`${this.selectedRows.size} satır seçili`).show();
            } else {
                info.text('').hide();
            }
        });

        return checkboxTd;
    }

    /**
     * @private
     * @method #buildBodyRowNumbers
     * @description Satır numarasını gösteren hücreyi oluşturur.
     * @param {object} row - Satır verisi.
     * @param {Array<Object>} pageData - Sayfadaki veri dizisi.
     * @returns {string} `<td>` etiketi içeren HTML string.
     */
    #buildBodyRowNumbers(row, pageData) {
        const globalIndex = this.usePagination ? (this.index - 1) * this.pageSize + pageData.indexOf(row) + 1 : pageData.indexOf(row) + 1;
        return `<td class="text-center">${globalIndex}</td>`;
    }

    /**
     * @private
     * @method #buildBodyActionColumn
     * @description Her satır için işlem butonlarını (`edit`, `delete` vb.) oluşturur.
     * @param {object} row - Satır verisi.
     * @returns {jQuery} İşlem butonlarını içeren `<td>` elementi.
     */
    #buildBodyActionColumn(row) {
        const td = $('<td class="text-center"></td>');
        this.actionColumns.forEach(action => {
            const btn = $(`<button class="${action.className}" title="${action.label}">${action.icon ? `<i class="${action.icon}"></i>` : action.label}</button>`);
            if (action.onClick) {
                btn.on("click", async () => {
                    try {
                        btn.prop("disabled", true).addClass("opacity-50");
                        const result = action.onClick(row);
                        if (result instanceof Promise) await result;
                    } catch (err) {
                        console.error("CinciTable: action butonu hata verdi:", err);
                    } finally {
                        btn.prop("disabled", false).removeClass("opacity-50");
                    }
                });
            }
            td.append(btn);
        });
        return td;
    }

    /**
     * @private
     * @method #buildFooter
     * @description Tablo alt kısmını (`<tfoot>`) oluşturur.  
     * Aggregate (toplam, ortalama, sayım) hesaplamalarını içerir.
     *
     * @returns {jQuery|null} Footer öğesi veya `null`.
     */
    #buildFooter() {
        const footerCols = Object.entries(this.columnSettings).filter(([_, col]) => col.aggregate);
        if (footerCols.length === 0) return null;

        const tfoot = $('<tfoot></tfoot>');
        const tr = $('<tr></tr>');

        if (this.enableSelection) {
            const footerSelectionTd = this.#buildFooterSelection();
            tr.append(footerSelectionTd);
        }

        if (this.showRowNumbers) {
            const footerRowNumbersTd = this.#buildFooterRowNumbers();
            tr.append(footerRowNumbersTd);
        }

        let allFilteredData = [...this.data];
        if (this.globalSearch && this.globalSearch.trim() !== "") {
            const term = this.globalSearch.toLowerCase();
            allFilteredData = allFilteredData.filter(row => {
                return Object.keys(this.columnSettings).some(key => {
                    const col = this.columnSettings[key];
                    if (!col.visible) return false;
                    const text = this.#getCellSearchableText(row, key).toLowerCase();
                    return text.includes(term);
                });
            });
        }
        if (this.columnSearches && Object.keys(this.columnSearches).length > 0) {
            allFilteredData = allFilteredData.filter(row => {
                return Object.entries(this.columnSearches).every(([key, term]) => {
                    if (!term) return true;
                    const haystack = this.#getCellSearchableText(row, key).toLowerCase();
                    return haystack.includes(String(term).toLowerCase());
                });
            });
        }
        if (Object.keys(this.activeFilters).length > 0) {
            allFilteredData = allFilteredData.filter(row => {
                return Object.entries(this.activeFilters).every(([key, values]) => {
                    if (!values || values.length === 0) return true;
                    const col = this.columnSettings[key];
                    const cellValue = typeof col.filterSource === "function" ? col.filterSource(row) : row[key];
                    return values.includes(cellValue);
                });
            });
        }
        for (const key in this.columnSettings) {
            const col = this.columnSettings[key];
            if (!col.visible) continue;
            let result = "";
            if (col.aggregate) {
                const values = allFilteredData.map(row => parseFloat(row[key])).filter(v => !isNaN(v));
                if (col.aggregate === "sum") {
                    result = values.reduce((a, b) => a + b, 0);
                } else if (col.aggregate === "avg") {
                    result = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 0;
                } else if (col.aggregate === "count") {
                    result = values.length;
                } else if (typeof col.aggregate === "function") {
                    result = col.aggregate(allFilteredData);
                }
                if (col.aggregateLabel) {
                    result = `${col.aggregateLabel}: ${result}`;
                }
            }
            const td = $(`<td class="${col.contentAlign || ''} fw-bold">${result}</td>`);
            tr.append(td);
        }

        if (this.actionColumns.length > 0) {
            const footerActionTd = this.#buildFooterActionColumn();
            tr.append(footerActionTd);
        }

        tfoot.append(tr);
        return tfoot;
    }

    /**
     * @private
     * @method #buildFooterSelection
     * @description Footer’da seçim sütunu boş hücresini oluşturur.
     * @returns {string} `<td>` etiketi içeren HTML string.
     */
    #buildFooterSelection() {
        return `<td class="text-center fw-bold"></td>`;
    }

    /**
     * @private
     * @method #buildFooterRowNumbers
     * @description Footer satır numarası boş hücresini oluşturur.
     * @returns {string} `<td>` etiketi içeren HTML string.
     */
    #buildFooterRowNumbers() {
        return `<td class="text-center fw-bold"></td>`;
    }

    /**
     * @private
     * @method #buildFooterActionColumn
     * @description Footer işlem sütunu boş hücresini oluşturur.
     * @returns {string} `<td>` etiketi içeren HTML string.
     */
    #buildFooterActionColumn() {
        return `<td class="text-center fw-bold"></td>`;
    }

    /**
     * @method render
     * @description Tabloyu ve bileşenlerini (header, body, footer, pagination, title) yeniden oluşturur.  
     * Ana render metodudur; tablo içeriği güncellendiğinde çağrılır.
     *
     * @returns {CinciGrid} Mevcut sınıf örneğini döner (method chaining için).
     */
    render() {
        const pageData = this.#getPagedData();
        this._currentViewData = pageData;
        this._currentViewIndices = pageData.map(row => this.data.indexOf(row)).filter(index => index !== -1);
        
        const table = $(`<table id="${this.tableId || ''}" class="cinci-grid ${this.tableClasses || ''}"></table>`);
        table.append(this.#buildHeader(this._currentViewIndices));
        table.append(this.#buildBody(pageData));
        const footer = this.#buildFooter();
        if (footer) table.append(footer);
        this.selector.empty();

        const headerContainer = this.#buildHeaderContainer();

        if (this.showTitle && this.tableTitle) {
            const titleEl = $(`<h5 class="table-title mb-0 fw-bold">${this.tableTitle}</h5>`);
            headerContainer.find(".table-header-left").append(titleEl);
        }

        if (this.enableGlobalSearchBar) {
            const searchInput = $(`<input type="text" class="form-control form-control-sm global-search-input" placeholder="${this.globalSearchPlaceholder}" style="width: 250px;">`);
            searchInput.val(this.globalSearch);
            searchInput.on("keydown", (e) => {
                if (e.key === "Enter") {
                    this.globalSearch = e.target.value.trim();
                    this.index = 1;
                    this.render();
                }
            });
            headerContainer.find(".table-header-right").append(searchInput);
        }

        const resetBtn = $(`<button class="btn btn-sm btn-outline-secondary reset-table-btn" title="Filtreleri, aramaları ve sıralamayı sıfırla">⟳</button>`);
        const isDefaultState = !this.globalSearch && Object.keys(this.activeFilters).length === 0 && Object.keys(this.columnSearches).length === 0 && !this.sortKey && this.sortOrder === "asc" && this.index === 1;
        resetBtn.prop("disabled", isDefaultState);
        resetBtn.on("click", () => {
            this.globalSearch = "";
            this.columnSearches = {};
            this.activeFilters = {};
            this.sortKey = null;
            this.sortOrder = "asc";
            this.index = 1;
            this.render();
        });
        headerContainer.find(".table-header-right").append(resetBtn);

        if (this.enableSelection && this.selectedRows.size > 0) {
            const info = $(`<span class="selectedRowInfo text-muted small">${this.selectedRows.size} satır seçili</span>`);
            headerContainer.find(".table-header-right").prepend(info);
        }

        this.selector.append(headerContainer);
        this.selector.append(table);
        this.tableElement = table;
        if (this.usePagination && this.totalCount > 0) {
            const footerContainer = this.#buildFooterContainer();
            if (footerContainer) {
                this.selector.append(footerContainer);
                this.paginationElement = footerContainer;
            }
        }
        return this;
    }

    /**
     * @private
     * @method #buildHeaderContainer
     * @description Başlık (title, global search, reset, seçili satır bilgisi) alanını oluşturur.
     * @returns {jQuery} Header container (`<div>`) elementi.
     */
    #buildHeaderContainer() {
        return $(`
            <div class="headerContainer d-flex justify-content-between align-items-center py-3 px-2" style="${this.headerContainerStyle}">
                <div class="table-header-left"></div>
                <div class="table-header-right d-flex align-items-center gap-2"></div>
            </div>
        `);
    }
}