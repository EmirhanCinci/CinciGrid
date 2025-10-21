export class PaginationModule {
    constructor(options = {}) {
        this.state = {
            enabled: options.enabled ?? false,
            paginationContainer: options.paginationContainer instanceof jQuery ? options.paginationContainer : $(options.paginationContainer),
            pageSize: options.pageSize ?? 5,
            index: options.index ?? 1,
            totalCount: options.totalCount ?? 0,
            showNumbers: options.showNumbers ?? true,
            visibleRange: options.visibleRange ?? 3,
            showInfo: options.showInfo ?? false,
            infoContainer: options.infoContainer instanceof jQuery ? options.infoContainer : $(options.infoContainer),
            responsive: options.responsive ?? true,
            mobileBreakpoint: options.mobileBreakpoint ?? 576
        };

        this.onPageChange = typeof options.onPageChange === "function" ? options.onPageChange : () => {};

        if (this.state.responsive) {
            $(window).on("resize.pagination", () => this.render());
        }

        this.render();
    }

    #goTo(pageNumber) {
        console.log(pageNumber);
        const total = this.getTotalPages();
        if (pageNumber < 1) pageNumber = 1;
        if (pageNumber > total) pageNumber = total;
        this.state.index = pageNumber;
        this.onPageChange(this.state.index, this.state.pageSize);
        return this;
    }

    getTotalPages() {
        return Math.ceil(this.state.totalCount / this.state.pageSize) || 1;
    }

    setTotalCount(count) {
        this.state.totalCount = count;
        this.state.index = 1;
        return this;
    }

    setPageSize(size) {
        this.state.pageSize = size;
        this.state.index = 1;
        return this;
    }

    next() { 
        return this.#goTo(this.state.index + 1); 
    }

    prev() { 
        return this.#goTo(this.state.index - 1); 
    }

    first() {
        return this.#goTo(1); 
    }

    last() { 
        return this.#goTo(this.getTotalPages()); 
    }

    #buildPaginationButton(label, disabled, active, action) {
        const li = $(`<li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}"></li>`);
        const btn = $(`<button class="page-link">${label}</button>`);
        if (!disabled) btn.on("click", action);
        li.append(btn);
        return li;
    }

    buildPagination() {
        if (!this.state.enabled) return;

        const ul = $('<ul class="pagination mb-0"></ul>');
        const current = this.state.index;
        const totalPages = this.getTotalPages();
        const isMobile = this.state.responsive && window.innerWidth <= this.state.mobileBreakpoint;

        ul.append(this.#buildPaginationButton("«", current === 1, false, () => this.first().render()));
        ul.append(this.#buildPaginationButton("Önceki", current === 1, false, () => this.prev().render()));

        if (!isMobile && this.state.showNumbers) {
            const half = Math.floor(this.state.visibleRange / 2);
            let start = Math.max(1, current - half);
            let end = start + this.state.visibleRange - 1;

            if (end > totalPages) {
                end = totalPages;
                start = Math.max(1, end - this.state.visibleRange + 1);
            }

            for (let i = start; i <= end; i++) {
                ul.append(this.#buildPaginationButton(i, false, i === current, () => this.#goTo(i).render()));
            }
        }

        ul.append(this.#buildPaginationButton("Sonraki", current === totalPages, false, () => this.next().render()));
        ul.append(this.#buildPaginationButton("»", current === totalPages, false, () => this.last().render()));

        this.state.paginationContainer.empty().append(ul);
    }


    buildInfoText() {
        const total = this.state.totalCount;
        if (total === 0) return "Kayıt bulunamadı.";

        const start = (this.state.index - 1) * this.state.pageSize + 1;
        const end = Math.min(start + this.state.pageSize - 1, total);
        const totalPages = this.getTotalPages();

        if (this.state.infoContainer && this.state.infoContainer.length) {
            this.state.infoContainer.text(`Toplam ${total} kayıttan ${start}-${end} arası gösteriliyor (Sayfa ${this.state.index}/${totalPages}).`);
        }
    }

    render() {
        if (this.state.enabled) {
            this.buildPagination();
        }

        if (this.state.showInfo && this.state.infoContainer && this.state.infoContainer.length) {
            this.buildInfoText();
        }
        return this;
    }
}