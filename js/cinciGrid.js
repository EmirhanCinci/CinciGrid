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
}