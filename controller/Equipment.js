const openEquipmentModalBtn = document.getElementById('openEquipmentModal');
const closeEquipmentModalBtn = document.getElementById('closeEquipmentModal');
const addEquipmentModal = document.getElementById('addEquipmentModal');
const addEquipmentForm = document.getElementById('addEquipmentForm');
const equipmentTableBody = document.getElementById('equipmentTableBody');

const editEquipmentModal = document.getElementById('editEquipmentModal');
const editEquipmentForm = document.getElementById('editEquipmentForm');
const closeEditEquipmentModalBtn = document.getElementById('closeEditEquipmentModal');

let currentRow; 

getAllEquipment();

// Open "Add Equipment" modal
openEquipmentModalBtn.addEventListener('click', () => {
    generateEquipmentId((id) => {
        document.getElementById('equipmentId').value = id;
    });
    loadFieldOptions();
    loadStaffOptions();
    addEquipmentModal.classList.remove('hidden');
});

// Close "Add Equipment" modal
closeEquipmentModalBtn.addEventListener('click', () => {
    addEquipmentModal.classList.add('hidden');
});

// Handle form submission for adding new equipment
addEquipmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const Id = document.getElementById('equipmentId').value;
    const Ename = document.getElementById('equipmentName').value;
    const Type = document.getElementById('equipmentType').value;
    const status = document.getElementById('equipmentStatus').value.toUpperCase();
    const staffId = document.getElementById('assignedStaff').value;
    const fieldId = document.getElementById('assignedField').value;

    if (!Id || !Ename || !Type || !status || !staffId || !fieldId) {
        alert("Please fill out all equipment.");
        return;
    }

    try {
        const fieldObj = await fetchField(fieldId);
        const staffObj = await fetchStaff(staffId);

        if (!fieldObj || !staffObj) {
            alert("Failed to load field or staff data. Please check the IDs and try again.");
            return;
        }

        const equipmentData = {
            equipmentId: Id,
            name: Ename,
            equipmentType: Type,
            status: status,
            staff: staffObj,
            field: fieldObj,
        };

        saveEquipment(equipmentData);
    } catch (error) {
        console.error("Error during form submission:", error);
        alert("Failed to process the request. Please try again.");
    }
});

function fetchField(fieldId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://localhost:8080/api/v1/fields/${fieldId}`,
            method: "GET",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
            },
            success: (field) => resolve(field),
            error: (error) => {
                console.error("Error loading field:", error);
                reject(error);
            },
        });
    });
}

function fetchStaff(staffId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://localhost:8080/api/v1/staff/${staffId}`,
            method: "GET",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
            },
            success: (staff) => resolve(staff),
            error: (error) => {
                console.error("Error loading staff:", error);
                reject(error);
            },
        });
    });
}

function getAllEquipment() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/equipment',
        method: 'GET',
        contentType: 'application/json',
    })
        .done((equipmentList) => {
            equipmentTableBody.innerHTML = '';

            equipmentList.forEach((equipment) => {
                const row = document.createElement('tr');
                row.classList.add('border-b');

                row.innerHTML = `
                    <td class="p-2 text-center">${equipment.equipmentId}</td>
                    <td class="p-2 text-center">${equipment.name}</td>
                    <td class="p-2 text-center">${equipment.equipmentType}</td>
                    <td class="p-2 text-center">${equipment.status}</td>
                    <td class="p-2 text-center">${equipment.staff.id || 'N/A'}</td>
                    <td class="p-2 text-center">${equipment.field.fieldCode || 'N/A'}</td>
                    <td class="p-4 text-center space-x-3">
                        <button class="text-blue-500 px-1 editEquipmentBtn">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="text-red-500 border-2 border-red-400 rounded-full px-1 delete-equipment-btn">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </td>
                `;

                equipmentTableBody.appendChild(row);

                row.querySelector('.editEquipmentBtn').addEventListener('click', () => {
                    editEquipment(equipment,equipment.equipmentId);
                });

                row.querySelector('.delete-equipment-btn').addEventListener('click', () => {
                    deleteEquipment(equipment.equipmentId);
                });
            });
        })
        .fail((error) => {
            console.error('Error fetching equipment:', error);
            alert('Failed to fetch equipment. Please try again later.');
        });
}

function saveEquipment(data) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/equipment',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
    })
        .done((response) => {
            console.log('Equipment added successfully:', response);
            getAllEquipment(); 
            addEquipmentModal.classList.add('hidden');
            addEquipmentForm.reset(); 
        })
        .fail((error) => {
            console.error('Error adding equipment:', error);
            alert(error.responseJSON?.message || 'Failed to add equipment. Please try again.');
        });
}



// Function to edit equipment data
async function editEquipment(equipment, id) {
    document.getElementById('editEquipmentId').value = id;
    document.getElementById('editEquipmentName').value = equipment.name;
    document.getElementById('editEquipmentType').value = equipment.equipmentType;

    const statusField = document.getElementById('editEquipmentStatus');
    if ([...statusField.options].some(opt => opt.value === equipment.status.toUpperCase())) {
        statusField.value = equipment.status.toUpperCase();
    } else {
        console.warn('Status value does not match any option:', equipment.status);
    }

    await loadEditStaffOptions();
    const staffField = document.getElementById('editAssignedStaff');
    if ([...staffField.options].some(opt => opt.value === equipment.staff.id)) {
        staffField.value = equipment.staff.id;
    } else {
        console.warn('Staff ID does not match any option:', equipment.staff.id);
    }

    await loadEditFieldOptions();
    const fieldField = document.getElementById('editAssignedField');
    if ([...fieldField.options].some(opt => opt.value === equipment.field.fieldCode)) {
        fieldField.value = equipment.field.fieldCode;
    } else {
        console.warn('Field code does not match any option:', equipment.field.fieldCode);
    }

    editEquipmentModal.classList.remove('hidden');
}



document.querySelectorAll('.editEquipmentBtn').forEach(button => {
    button.addEventListener('click', function() {
        editEquipment(this);
    });
});

// Close the modal on cancel button click
closeEditEquipmentModalBtn.addEventListener('click', () => {
    editEquipmentModal.classList.add('hidden');
});

// Handle form submission to save edited equipment data
editEquipmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const Id = document.getElementById('editEquipmentId').value;
    const Ename = document.getElementById('editEquipmentName').value;
    const Type = document.getElementById('editEquipmentType').value;
    const status = document.getElementById('editEquipmentStatus').value.toUpperCase();
    const staffId = document.getElementById('editAssignedStaff').value;
    const fieldId = document.getElementById('editAssignedField').value;

    if (!Id || !Ename || !Type || !status || !staffId || !fieldId) {
        alert("Please fill out all equipment.");
        return;
    }

    try {
        const fieldObj = await fetchField(fieldId);
        const staffObj = await fetchStaff(staffId);

        if (!fieldObj || !staffObj) {
            alert("Failed to load field or staff data. Please check the IDs and try again.");
            return;
        }

        const equipmentData = {
            equipmentId: Id,
            name: Ename,
            equipmentType: Type,
            status: status,
            staff: staffObj,
            field: fieldObj,
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/equipment/${Id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(equipmentData),
        })
            .done((response) => {
                console.log('Equipment updated successfully:', response);
                getAllEquipment();
                editEquipmentModal.classList.add('hidden');
            })
            .fail((error) => {
                console.error('Error updating equipment:', error);
                alert(error.responseJSON?.message || 'Failed to update equipment. Please try again.');
            });
    } catch (error) {
        console.error("Error during form submission:", error);
        alert("Failed to process the request. Please try again.");
    }
});


// Function to delete equipment
function deleteEquipment(equipmentId) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        $.ajax({
            url: `http://localhost:8080/api/v1/equipment/${equipmentId}`,
            method: 'DELETE',
        })
            .done(() => {
                console.log('Equipment deleted successfully.');
                getAllEquipment();
            })
            .fail((error) => {
                console.error('Error deleting equipment:', error);
                alert('Failed to delete equipment. Please try again.');
            });
    }
}

function generateEquipmentId(callback) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/equipment/generateId',
        method: 'GET',
    })
        .done((id) => {
            if (callback) callback(id);
        })
        .fail((error) => {
            console.error('Error generating equipment ID:', error);
            alert('Failed to generate equipment ID. Please try again later.');
        });
}

function loadStaffOptions() {
    $.ajax({
        url: "http://localhost:8080/api/v1/staff",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
        },
        success: function(staff) {
            const staffDropdown = document.getElementById('assignedStaff');
            
            staffDropdown.innerHTML = '<option value="">Select Staff</option>';
            
            staff.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id; 
                option.textContent = staff.id;
                staffDropdown.appendChild(option);
            });
        },
        error: function(error) {
            console.error("Error loading staff:", error);
            alert("Failed to load staff. Please try again later.");
        }
    });
}

function loadFieldOptions() {
    $.ajax({
        url: "http://localhost:8080/api/v1/fields",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
        },
        success: function(fields) {
            const cropFieldDropdown = document.getElementById('assignedField');
            
            cropFieldDropdown.innerHTML = '<option value="">Select Field</option>';
            
            fields.forEach(field => {
                const option = document.createElement('option');
                option.value = field.fieldCode; 
                option.textContent = field.fieldCode;
                cropFieldDropdown.appendChild(option);
            });
        },
        error: function(error) {
            console.error("Error loading fields:", error);
            alert("Failed to load fields. Please try again later.");
        }
    });
}

function loadEditStaffOptions() {
    $.ajax({
        url: "http://localhost:8080/api/v1/staff",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
        },
        success: function(staff) {
            const staffDropdown = document.getElementById('editAssignedStaff');
            
            staffDropdown.innerHTML = '<option value="">Select Staff</option>';
            
            staff.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id; 
                option.textContent = staff.id;
                staffDropdown.appendChild(option);
            });
        },
        error: function(error) {
            console.error("Error loading staff:", error);
            alert("Failed to load staff. Please try again later.");
        }
    });
}

function loadEditFieldOptions() {
    $.ajax({
        url: "http://localhost:8080/api/v1/fields",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
        },
        success: function(fields) {
            const cropFieldDropdown = document.getElementById('editAssignedField');
            
            cropFieldDropdown.innerHTML = '<option value="">Select Field</option>';
            
            fields.forEach(field => {
                const option = document.createElement('option');
                option.value = field.fieldCode; 
                option.textContent = field.fieldCode;
                cropFieldDropdown.appendChild(option);
            });
        },
        error: function(error) {
            console.error("Error loading fields:", error);
            alert("Failed to load fields. Please try again later.");
        }
    });
}