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
        this.tableClasses = "";

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
        this.headerContainerStyle = "";

        /**
         * @property {string} footerContainerStyle
         * @description Tablo alt (footer) kontrol alanının özel CSS stillerini tanımlar.  
         * Genellikle sayfalama ve toplam bilgi alanının stilini değiştirmek için kullanılır.
         *
         * @example
         * grid.footerContainerStyle = "background-color: #fff; border-top: 1px solid #ddd;";
         */
        this.footerContainerStyle = "";

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
        if (this.tableElement) this.tableElement.removeClass().addClass(this.tableClasses);
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
        const allSelected = this.data.length > 0 && this.selectedRows.size === this.data.length;
        this.selector.find(".select-all-checkbox").prop("checked", allSelected);
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
            const valA = a[key];
            const valB = b[key];
            if (valA == null) return 1;
            if (valB == null) return -1;
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
        });
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
                style="${this.foooterContainerStyle}">
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
}