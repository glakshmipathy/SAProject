// Function to fetch documents from the data folder
function fetchDocuments() {
    const folderPath = "data/"; // Path to the data folder
    const fileExtensions = ["txt"]; // Allowed file extensions
  
    // Regular expression to match file names
    const fileNameRegex = /^(CIA|DIA|FBI|USCBP)_\d+|DIA_docs|USCBP_docs$/;
  
    $.ajax({
      url: folderPath,
      success: function (data) {
        $(data).find("a").attr("href", function (_, href) {
          if (fileNameRegex.test(href)) {
            const fileName = href.substring(0, href.lastIndexOf('.'));
            const fileExtension = href.split('.').pop().toLowerCase();
            if (fileExtensions.includes(fileExtension)) {
              // Corrected call to fetchDocumentContent
              fetchDocumentContent(folderPath, href, fileName); // Pass folderPath as an argument
            }
          }
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching documents:", error);
      }
    });
  }
  
  function fetchDocumentContent(folderPath, filePath, fileName) {
    $.ajax({
      url: folderPath + fileName + ".txt", // Use the folderPath argument
      dataType: "text",
      success: function (data) {
        // Create a document object and add it to the documents array
        documents.push({ id: fileName, content: data });
        // Update the document list
        populateDocumentList();
      },
      error: function (xhr, status, error) {
        console.error("Error fetching document content:", error);
      }
    });
  }
  

// Function to populate document list
function populateDocumentList() {
    const list = d3.select("#document-list");

    list.selectAll("li")
        .data(documents, d => d.id)
        .join("li")
        .text(d => `Document ${d.id}`)
        .on("click", function(d) {
            // Handle single and multiple selection
            const selected = d3.select(this).classed("selected");
            d3.select(this).classed("selected", !selected);
            const selectedDocuments = list.selectAll(".selected").data();

            // Display selected documents in workspace
            displayDocuments(selectedDocuments);
        });
}

// Function to display selected documents in workspace
function displayDocuments(selectedDocuments) {
    const workspace = d3.select("#workspace");

    // Clear workspace
    workspace.selectAll("*").remove();

    // Display selected documents
    selectedDocuments.forEach(doc => {
        workspace.append("div")
            .attr("class", "document")
            .text(doc.content)
            .call(d3.drag()
                .on("drag", function() {
                    d3.select(this).style("left", d3.event.x + "px")
                        .style("top", d3.event.y + "px");
                })
            );
    });
}

// Initialize documents array
const documents = [];

// Initialize document list and workspace
fetchDocuments();
