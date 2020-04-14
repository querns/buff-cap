
(() => {
    const calculateTotalBuffs = () => {
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

            window.location.hash = hash;
        } else {
            window.location.hash = "";
        }
    };

    $("#clear-all").click(() => {
        $("input[type='checkbox']").prop("checked", false);
        calculateTotalBuffs();
        $(".buff-count").text("");
    });

    $(".bc-cell-header button").click(e => {
        $(e.currentTarget).closest(".bc-cell")
            .find("input[type='checkbox']").prop("checked", false)
            .end()
            .find(".buff-count").text("");
        calculateTotalBuffs();
    });

    $(".buff-count").click(e => {
        $(e.currentTarget).closest(".has-buff-count").find("input[type='checkbox']").prop("checked", false);
        $(e.currentTarget).text("");
        calculateTotalBuffs();
    });

    function calculateSubSection(currentTarget) {
        const buffCount = $(currentTarget).closest("ul").find("input[type='checkbox']:checked").length;
        $(currentTarget).closest(".has-buff-count").find(".buff-count").text(buffCount === 0 ? "" : buffCount);
    }

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

    const clipboard = new Clipboard("#clipboard-button", {
        text: () => window.location.href,
    });
    clipboard.on("success", () => {
        $("#copy-toast").toast("show");
    });

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
    }

    calculateTotalBuffs();
})();