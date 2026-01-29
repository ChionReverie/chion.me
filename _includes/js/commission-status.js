async function WriteCommissionStatus() {
  const selection = document.querySelectorAll(
    '[data-insert="commission-status"]'
  );
  if (selection.length == 0) {
    return;
  }

  const commissionText = await RetrieveCommissionText();

  selection.forEach((target, _a, _b) => {
    if(commissionText) {
      target.innerHTML = commissionText;
      return; // Continue loop
    }

    const defaultText = target.attributes.getNamedItem("data-default-text");
    if(defaultText) {
      target.innerHTML = defaultText.textContent;
      return;
    }
  });
}

async function RetrieveCommissionText(params) {
  let response;

  try {
    response = await fetch("https://chion.me/api/commission_status", {
      method: "GET",
    });
  } catch (error) {
    return null;
  }
  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (data.status == "open") {
    return `Commissions Open <br> (${data.slots_available}/${data.slots_max} slots available)`;
  } else if (data.status == "closed") {
    return "Commissions Closed";
  } else {
    return `Commissions ${data.status}`;
  }
}

window.addEventListener("load", async (event) => {
  await WriteCommissionStatus();
});
