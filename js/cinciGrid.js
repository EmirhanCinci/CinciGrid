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
}