function calculateTotalBuffs() {
    const badge = $("#total-buff-count");
    let count = 0;
    let badgeClass = "badge-success";
    let selectedBuffs = [];

    $("input[type='checkbox']").each((index, element) => {
        if ($(element).prop("checked")) {
            count++;

            const id = $(element).prop("id");
            const match = id.match(/spell-(\d+)/);
            if (match) {
                const spellID = match[1];
                selectedBuffs.push(spellID);
            }
        }
    });

    if (count >= 28) {
        badgeClass = "badge-warning";
    }

    if (count >= 32) {
        badgeClass = "badge-danger";
    }

    badge.removeClass("badge-success badge-warning badge-danger").addClass(badgeClass).text(count);

    if (selectedBuffs.length > 0) {
        const bytes16 = new Uint16Array(selectedBuffs.sort());
        const bytes8 = new Uint8Array(bytes16.buffer);
        let binary = "";
        for (let i = 0; i < bytes8.byteLength; i++) {
            binary += String.fromCharCode( bytes8[i] );
        }
        let hash = btoa(binary);
        hash = hash.replace(/\+/g, '-');
        hash = hash.replace(/\//g, '_');

        history.replaceState(null, null, `#${hash}`);
    } else {
        history.replaceState(null, null, "#");
    }
}

function calculateSubSection(currentTarget) {
    const selectedBuffs = $(currentTarget).closest("ul").find("input[type='checkbox']:checked");
    const summary = $(currentTarget).closest(".has-buff-count").find(".buff-summary");
    $(currentTarget)
        .closest(".has-buff-count")
        .find(".buff-count").text(selectedBuffs.length === 0 ? "" : selectedBuffs.length);

    $(summary).empty();
    $(selectedBuffs).each((index, element) => {
        return $(element).closest("li")
            .find("a:not(:has(img[data-info])):not([data-info])")
            .clone().appendTo(summary);
    });
}

function loadBuffsFromURL() {
    let hash = window.location.hash;
    if (hash.length > 0) {
        hash = hash.replace(/-/g, "+");
        hash = hash.replace(/_/g, "/");
        hash = hash.replace(/#/g, "");
        const raw = atob(hash);
        const rawLength = raw.length;
        const int8Array = new Uint8Array(new ArrayBuffer(rawLength));

        for (let i = 0; i < rawLength; i++) {
            int8Array[i] = raw.charCodeAt(i);
        }

        const int16Array = new Uint16Array(int8Array.buffer);
        int16Array.forEach(buff => {
            $(`#spell-${buff}`).prop("checked", true);
        });
        $(".has-buff-count").each((index, element) => {
            calculateSubSection($(element).find("input[type='checkbox']").first());
        });

        $("#personal-buffs .has-buff-count").has("input:checked").find(".collapse:not([data-info])").collapse("show");
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

(() => {
    $("#clear-all").click(() => {
        $("input[type='checkbox']").prop("checked", false);
        calculateTotalBuffs();
        $(".buff-count").text("");
        $(".buff-summary").empty();
    });

    $(".bc-cell-header button").click(e => {
        $(e.currentTarget).closest(".bc-cell")
            .find("input[type='checkbox']").prop("checked", false).end()
            .find(".buff-count").text("").end()
            .find(".buff-summary").empty();

        if ($(e.currentTarget).closest(".bc-cell").attr("id") === "personal-buffs") {
            $("#personal-buffs .has-buff-count").find(".collapse").collapse("hide");
        }

        calculateTotalBuffs();
    });

    $(".buff-count").click(e => {
        $(e.currentTarget).closest(".has-buff-count")
            .find("input[type='checkbox']").prop("checked", false).end()
            .find(".buff-summary").empty();

        $(e.currentTarget).text("");
        calculateTotalBuffs();
    });

    $(".has-buff-count input[type='checkbox']").click(e => calculateSubSection(e.currentTarget));

    $('[data-toggle="tooltip"]').tooltip();

    $("input[data-exclusive]").click(e => {
        if ($(e.currentTarget).prop("checked")) {
            const category = $(e.currentTarget).data("exclusive");
            $(`input[data-exclusive='${category}']`).each((index, checkbox) => {
                if (checkbox !== e.currentTarget) {
                    $(checkbox).prop("checked", false);
                }
            });

            calculateSubSection(e.currentTarget);
        }
    });

    $("input[type='checkbox']").click(calculateTotalBuffs);
    $("#personal-buffs").find("input[type='checkbox']").click(e => {
        const clickedClassType = $(e.currentTarget).closest("[data-class]").data("class");
        const foreignPersonalBuffs = $(`#personal-buffs ul[data-class!='${clickedClassType}']`).find("input[type='checkbox']:checked")

        if (foreignPersonalBuffs.length > 0) {
            foreignPersonalBuffs.prop("checked", false);
            foreignPersonalBuffs.each((index, element) => calculateSubSection(element));
            calculateTotalBuffs();
            $("#buff-class-removed").text($(foreignPersonalBuffs).one().closest("[data-class]").data("class").toString().capitalize());
            $("#buff-class-selected").text(clickedClassType.capitalize());
            $("#personal-buff-toast").toast("show");
        }
    });

    $(document).on("show.bs.collapse", (e) => {
        $(e.target).closest(".has-buff-count").find(".buff-summary").hide();
    });

    $(document).on("hide.bs.collapse", (e) => {
        $(e.target).closest(".has-buff-count").find(".buff-summary").show();
    });

    const clipboard = new Clipboard("#clipboard-button", {
        text: () => window.location.href,
    });
    clipboard.on("success", () => {
        $("#copy-toast").toast("show");
    });

    loadBuffsFromURL();
    calculateTotalBuffs();
})();