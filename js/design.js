import CustomTable from "../js/cinciGrid.js";

// Button tags
const btnChangeTableId = $('#btn-change-table-id');
const btnChangeTableClass = $('#btn-change-table-class');
const btnChangeTableRemoveClass = $('#btn-change-table-remove-class');
const btnChangeTableAddClass = $('#btn-change-table-add-class');
const btnChangeTableTitle = $('#btn-change-table-title');
const btnChangeTableHeaderContainerStyle = $('#btn-change-table-header-container-style');
const btnChangeTableHeaderContainerStyleAdd = $('#btn-change-table-header-container-style-add');
const btnChangeTableHeaderContainerStyleRemove = $('#btn-change-table-header-container-style-remove');
const btnChangeTableFooterContainerStyle = $('#btn-change-table-footer-container-style');
const btnChangeTableFooterContainerStyleAdd = $('#btn-change-table-footer-container-style-add');
const btnChangeTableFooterContainerStyleRemove = $('#btn-change-table-footer-container-style-remove');
const btnChangeTableGlobalSearchClose = $('#btn-change-table-global-search-close');
const btnChangeTableGlobalSearchOpen = $('#btn-change-table-global-search-open');
const btnChangeTableGlobalSearchPlaceHoldder = $('#btn-change-table-global-search-placeholder');
const btnChangeTableTotalCountInfoClose = $('#btn-change-table-total-count-info-close');
const btnChangeTableTotalCountInfoOpen = $('#btn-change-table-total-count-info-open');
const btnChangeTablePaginationClose = $('#btn-change-table-pagination-close');
const btnChangeTablePaginationOpen = $('#btn-change-table-pagination-open');
const btnChangeTableDataClear = $('#btn-change-table-data-clear');
const btnChangeTableDataSet = $('#btn-change-table-data-set');
const btnChangeTableCheckboxClose = $('#btn-change-table-checkbox-close');
const btnChangeTableCheckboxOpen = $('#btn-change-table-checkbox-open');
const btnChangeTableRowNumbersClose = $('#btn-change-table-row-numbers-close');
const btnChangeTableRowNumbersOpen = $('#btn-change-table-row-numbers-open');

// Datas
let users = [
    { id: 1, identityNumber: "01234567890", firstName: "Emirhan", lastName: "Cinci", userName: "ecinci", gender: "Erkek", age: 27 },
    { id: 2, identityNumber: "01234567890", firstName: "Ayşe", lastName: "Yılmaz", userName: "ayilmaz", gender: "Kadın", age: 32 },
    { id: 3, identityNumber: "01234567890", firstName: "Mert", lastName: "Kara", userName: "mkara", gender: "Erkek", age: 24 },
    { id: 4, identityNumber: "01234567890", firstName: "Elif", lastName: "Demir", userName: "edemir", gender: "Kadın", age: 29 },
    { id: 5, identityNumber: "01234567890", firstName: "Can", lastName: "Şahin", userName: "csahin", gender: "Erkek", age: 35 },
    { id: 6, identityNumber: "01234567890", firstName: "Selin", lastName: "Öztürk", userName: "sozturk", gender: "Kadın", age: 26 },
    { id: 7, identityNumber: "01234567890", firstName: "Burak", lastName: "Aydın", userName: "baydin", gender: "Erkek", age: 30 },
    { id: 8, identityNumber: "01234567890", firstName: "Derya", lastName: "Koç", userName: "dkoç", gender: "Kadın", age: 28 },
    { id: 9, identityNumber: "01234567890", firstName: "Hakan", lastName: "Polat", userName: "hpolat", gender: "Erkek", age: 33 },
    { id: 10, identityNumber: "01234567890", firstName: "Zeynep", lastName: "Taş", userName: "ztas", gender: "Kadın", age: 25 },
];

// Page codes
$(document).ready(function() {
    // btn-change-table-id button click event
    btnChangeTableId.on('click', () => userTableElement.setTableId("user-table-change"));

    // btn-change-table-class button click event
    btnChangeTableClass.on('click', () => userTableElement.setTableClass("table table-primary table-bordered table-hover"));

    // btn-change-table-remove-class button click event
    btnChangeTableRemoveClass.on('click', () => userTableElement.removeTableClass("table-primary"));

    // btn-change-table-add-class button click event
    btnChangeTableAddClass.on('click', () => userTableElement.addTableClass("table-striped"));

    // btn-change-table-title button click event
    btnChangeTableTitle.on('click', () => userTableElement.setTitle("Tablo Başlığı Değiştirildi."));

    // btn-change-table-header-container-style button click event
    btnChangeTableHeaderContainerStyle.on('click', () => userTableElement.setHeaderContainerStyle("background-color: blue;"));

    // btn-change-table-footer-container-style button click event
    btnChangeTableFooterContainerStyle.on('click', () => userTableElement.setFooterContainerStyle("background-color: red;"));

    // btn-change-table-header-container-style-add button click event
    btnChangeTableHeaderContainerStyleAdd.on('click', () => userTableElement.addHeaderContainerStyle("color: red;"));

    // btn-change-table-header-container-style-remove button click event
    btnChangeTableHeaderContainerStyleRemove.on('click', () => userTableElement.removeHeaderContainerStyle("background-color: blue;"));

    // btn-change-table-footer-container-style-add button click event
    btnChangeTableFooterContainerStyleAdd.on('click', () => userTableElement.addFooterContainerStyle("background-color: lightblue;"));

    // btn-change-table-footer-container-style-remove button click event
    btnChangeTableFooterContainerStyleRemove.on('click', () => userTableElement.removeFooterContainerStyle("background-color: red;"));

    // btn-change-table-global-search-close button event click
    btnChangeTableGlobalSearchClose.on('click', () => userTableElement.enableGlobalSearch(false));

    // btn-change-table-global-search-open button event click
    btnChangeTableGlobalSearchOpen.on('click', () => userTableElement.enableGlobalSearch(true));

    // btn-change-table-global-search-placeholder button event click
    btnChangeTableGlobalSearchPlaceHoldder.on('click', () => userTableElement.setGlobalSearchPlaceholder("Değiştirildi..."));

    // btn-change-table-total-count-info-close button click event
    btnChangeTableTotalCountInfoClose.on('click', () => userTableElement.enableTotalCountInfoMode(false));
    
    // btn-change-table-total-count-info-open button click event
    btnChangeTableTotalCountInfoOpen.on('click', () => userTableElement.enableTotalCountInfoMode(true));

    // btn-change-table-pagination-close button click event
    btnChangeTablePaginationClose.on('click', () => userTableElement.enablePagination(false));

    // btn-change-table-pagination-open button click event
    btnChangeTablePaginationOpen.on('click', () => userTableElement.enablePagination(true));

    // btn-change-table-data-clear button click event
    btnChangeTableDataClear.on('click', () => userTableElement.clearData());

    // btn-change-table-data-set button click event
    btnChangeTableDataSet.on('click', () => userTableElement.setData(users));

    // btn-change-table-checkbox-close button click event
    btnChangeTableCheckboxClose.on('click', () => userTableElement.enableRowSelection(false));

    // btn-change-table-checkbox-open button click event
    btnChangeTableCheckboxOpen.on('click', () => userTableElement.enableRowSelection(true));

    // btn-change-table-row-numbers-close button click event
    btnChangeTableRowNumbersClose.on('click', () => userTableElement.enableRowNumbers(false));

    // btn-change-table-row-numbers-open button click event
    btnChangeTableRowNumbersOpen.on('click', () => userTableElement.enableRowNumbers(true));

    // Cinci Grid
    const userTableElement = new CustomTable($('#userTableElement'));
    userTableElement.setData(users)
        .setPageSize(5)
        .setTableId("user-table")
        .setTableClass("table table-striped table-bordered table-hover")
        .setTitle("👷 Personel Listesi")
        .setColumn("identityNumber", {
            label: "T.C. Kimlik Numarası",
            headerAlign: "text-center",
            contentAlign: "text-start",
            visible: true
        })
        .setColumn("firstName", { 
            label: "Adı", 
            headerAlign: "text-center", 
            contentAlign: "text-start", 
            visible: true,
            sortable: true,
            searchable: true,
        })
        .setColumn("lastName", { 
            label: "Soyadı", 
            headerAlign: "text-center", 
            contentAlign: "text-start", 
            visible: true,
            searchable: true,
        })
        .setColumn("fullName", {
            label: "Adı ve Soyadı",
            headerAlign: "text-center",
            contentAlign: "text-start",
            visible: true,
            sortable: true,
            sortSource: (row) => `${row.firstName} ${row.lastName}`,
            filterable: true,
            filterSource: (row) => `${row.firstName} ${row.lastName}`,
            formatter: (row) => row.age > 30 ? `<span class='text-danger fw-bold'>${row.firstName} ${row.lastName}</span>` : `${row.firstName} ${row.lastName}`,
            searchable: true,
            searchSource: (row) => `${row.firstName} ${row.lastName}`
        })
        .setColumn("userName", { 
            label: "Kullanıcı Adı", 
            headerAlign: "text-center", 
            contentAlign: "text-start",
            visible: true,
            filterable: true,
            aggregate: (rows) => {
                const unique = [...new Set(rows.map(r => r.userName).filter(String))];
                return `${unique.length} farklı kullanıcı adı`;
            }
        })
        .setColumn("gender", { 
            label: "Cinsiyet", 
            headerAlign: "text-center",
            contentAlign: "text-start",
            contentStyle: (row) => `font-weight: ${row.age > 30 ? 'bold' : 'normal'};`,
            visible: true,
            cellClass: (row) => row.gender === "Erkek" ? "text-primary" : row.gender === "Kadın" ? "text-danger" : "text-muted",
            sortable: true,
            filterable: true,
            aggregate: (rows) => {
                const unique = [...new Set(rows.map(r => r.gender).filter(Boolean))];
                return `${unique.length} farklı cinsiyet`;
            }
        })
        .setColumn("age", { 
            label: "Kullanıcı Yaşı", 
            headerAlign: "text-center",
            contentAlign: "text-end", 
            visible: true,
            cellClass: "fst-italic",
            sortable: true,
            aggregateLabel: "Ortalama Yaş",
            aggregate: "avg"
        })
        .addActionColumn({
            label: "Detay",
            class: "btn btn-sm btn-primary",
            icon: "fa fa-eye",
            onClick: (rowData) => console.log("Detay:", rowData)
        })
        .addActionColumn({
            label: "Düzenle",
            class: "btn btn-sm btn-warning mx-3",
            icon: "fa fa-edit",
            onClick: (rowData) => console.log("Düzenle:", rowData)
        })
        .addActionColumn({
            label: "Sil",
            class: "btn btn-sm btn-danger",
            icon: "fa fa-trash",
            onClick: async (rowData) => {
                const index = users.findIndex(user => user.id === rowData.id);
                userTableElement.removeRow(index);
                console.log("Silindi", users);
                userTableElement.render();
            }
        })
        .enablePagination(true)
        .enableRowNumbers(true)
        .enableGlobalSearch(true)
        .setGlobalSearchPlaceholder("Genel tabloda ara...")
        .enableTotalCountInfoMode(true)
        .enableRowSelection(true) 
        .setHeaderContainerStyle("background-color: lightblue;")
        .setFooterContainerStyle("background-color: lightblue;")
        .render();
});