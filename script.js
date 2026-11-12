
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let students = [
  {id:"2026-00001",name:"Abigail Aquino",email:"abigail.aquino@registry.edu",age:18,course:"BS Computer Science",year:"1st year"},
  {id:"2025-00018",name:"Adrian Bautista",email:"adrian.bautista@registry.edu",age:19,course:"BS Business Administration",year:"2nd year"},
  {id:"2024-00042",name:"Aisha Cruz",email:"aisha.cruz@registry.edu",age:20,course:"BS Information Technology",year:"3rd year"},
  {id:"2023-00016",name:"Alexander Dela Rosa",email:"alexander.delarosa@registry.edu",age:21,course:"BS Accountancy",year:"4th year"},
  {id:"2026-00008",name:"Andrea Flores",email:"andrea.flores@registry.edu",age:18,course:"BS Information Technology",year:"1st year"},
  {id:"2025-00037",name:"Benjamin Garcia",email:"benjamin.garcia@registry.edu",age:20,course:"BS Computer Science",year:"2nd year"},
  {id:"2024-00063",name:"Camille Gonzales",email:"camille.gonzales@registry.edu",age:21,course:"BS Accountancy",year:"3rd year"},
  {id:"2023-00028",name:"Daniel Lim",email:"daniel.lim@registry.edu",age:22,course:"BS Business Administration",year:"4th year"},
  {id:"2026-00051",name:"Elena Mendoza",email:"elena.mendoza@registry.edu",age:19,course:"BS Computer Science",year:"1st year"},
  {id:"2025-00084",name:"Gabriel Navarro",email:"gabriel.navarro@registry.edu",age:19,course:"BS Information Technology",year:"2nd year"}
];

let currentPage = 1;

// NAVIGATION
function showPage(page) {
  $$(".page").forEach(el =>
    el.classList.toggle("active", el.id === `page-${page}`)
  );

  $$(".nav-link").forEach(el =>
    el.classList.toggle("active", el.dataset.page === page)
  );

  window.scrollTo({top:0, behavior:"smooth"});
}

$$(".nav-link").forEach(btn =>
  btn.addEventListener("click", () => showPage(btn.dataset.page))
);

$("#go-summary").addEventListener("click", () => showPage("summary"));
$("#go-enroll").addEventListener("click", () => showPage("enroll"));
$("#summary-directory").addEventListener("click", () => showPage("directory"));

// FORM VALIDATION
const form = $("#enrollment-form");

const fields = {
  studentId: {
    el:$("#student-id"),
    message:"Enter a valid student ID.",
    test:v=>/^\d{4}-\d{5}$/.test(v)
  },
  name: {
    el:$("#student-name"),
    message:"Enter the student's full name.",
    test:v=>v.trim().length>=3
  },
  email: {
    el:$("#student-email"),
    message:"Enter a valid email address.",
    test:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  },
  age: {
    el:$("#student-age"),
    message:"Enter a valid age (15–100).",
    test:v=>Number(v)>=15 && Number(v)<=100
  },
  course: {
    el:$("#student-course"),
    message:"Select a course.",
    test:v=>Boolean(v)
  },
  year: {
    el:$("#student-year"),
    message:"Select a year level.",
    test:v=>Boolean(v)
  }
};

Object.values(fields).forEach(({el}) =>
  el.addEventListener("input", () => validateField(el))
);

function validateField(el) {
  const key = Object.keys(fields).find(
    k => fields[k].el === el
  );

  const field = fields[key];
  const wrapper = el.closest(".field");
  const valid = field.test(el.value.trim());

  wrapper.classList.toggle("invalid", !valid);

  wrapper.querySelector(".field-error").textContent =
    valid ? "" : `ⓘ ${field.message}`;

  return valid;
}

// ENROLL STUDENT
form.addEventListener("submit", e => {
  e.preventDefault();

  const valid = Object.values(fields)
    .map(f => validateField(f.el))
    .every(Boolean);

  if (!valid) {
    $("#form-alert").classList.remove("hidden");

    const firstInvalid = $(".field.invalid input, .field.invalid select");

    if (firstInvalid) firstInvalid.focus();

    return;
  }

  const record = {
    id:fields.studentId.el.value.trim(),
    name:fields.name.el.value.trim(),
    email:fields.email.el.value.trim(),
    age:Number(fields.age.el.value),
    course:fields.course.el.value,
    year:fields.year.el.value
  };

  // CHECK DUPLICATE ID
  if (students.some(s =>
    s.id.toLowerCase() === record.id.toLowerCase()
  )) {
    fields.studentId.el.closest(".field").classList.add("invalid");

    fields.studentId.el.closest(".field")
      .querySelector(".field-error")
      .textContent = "ⓘ This student ID already exists.";

    $("#form-alert").classList.remove("hidden");
    return;
  }

  students.unshift(record);

  form.reset();

  $$(".field").forEach(el =>
    el.classList.remove("invalid")
  );

  $("#form-alert").classList.add("hidden");

  renderStudents();
  showPage("directory");

  alert("Student enrolled successfully!");
});

// CANCEL ENROLLMENT
$("#cancel-enroll").addEventListener("click", () => {
  form.reset();

  $$("#enrollment-form .field").forEach(el =>
    el.classList.remove("invalid")
  );

  $("#form-alert").classList.add("hidden");
});

// SEARCH AND FILTER
function filteredStudents() {
  const q = $("#search-students").value.toLowerCase().trim();
  const course = $("#filter-course").value;
  const year = $("#filter-year").value;

  return students.filter(s =>
    (!q || [s.id, s.name, s.email].some(v =>
      v.toLowerCase().includes(q)
    )) &&
    (!course || s.course === course) &&
    (!year || s.year === year)
  );
}

// DISPLAY STUDENT DIRECTORY
function renderStudents() {
  const list = filteredStudents();
  const perPage = Number($("#rows-per-page").value);

  const pages = Math.max(1, Math.ceil(list.length / perPage));

  currentPage = Math.min(currentPage, pages);

  const start = (currentPage - 1) * perPage;
  const visible = list.slice(start, start + perPage);

  $("#student-rows").innerHTML = visible.length
    ? visible.map(s => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.email)}</td>
        <td>${s.age}</td>
        <td>${escapeHTML(s.course)}</td>
        <td>${escapeHTML(s.year)}</td>
        <td>
          <button class="table-action view-student"
            data-id="${escapeHTML(s.id)}">View</button>

          <button class="table-action delete-student"
            data-id="${escapeHTML(s.id)}" title="Delete">···</button>
        </td>
      </tr>
    `).join("")
    : `<tr>
        <td colspan="7" style="text-align:center;padding:28px;color:#718096">
          No students match your search.
        </td>
      </tr>`;

  $("#student-count").textContent =
    `${students.length.toLocaleString()} students`;

  $("#showing-count").textContent =
    `Showing ${list.length ? start + 1 : 0}–${Math.min(start + perPage, list.length)} of ${list.length} students`;

  $("#page-number").textContent =
    `${currentPage} / ${pages}`;

  $("#prev-page").disabled = currentPage === 1;
  $("#next-page").disabled = currentPage === pages;

  $$(".view-student").forEach(btn =>
    btn.addEventListener("click", () =>
      openStudent(btn.dataset.id)
    )
  );

  $$(".delete-student").forEach(btn =>
    btn.addEventListener("click", () =>
      deleteStudent(btn.dataset.id)
    )
  );
}

// PREVENT HTML INJECTION
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

// FILTER EVENT LISTENERS
[
  "#search-students",
  "#filter-course",
  "#filter-year",
  "#rows-per-page"
].forEach(sel =>
  $(sel).addEventListener("input", () => {
    currentPage = 1;
    renderStudents();
  })
);

// PAGINATION
$("#prev-page").addEventListener("click", () => {
  currentPage = Math.max(1, currentPage - 1);
  renderStudents();
});

$("#next-page").addEventListener("click", () => {
  currentPage++;
  renderStudents();
});

// VIEW STUDENT DETAILS
function openStudent(id) {
  const s = students.find(x => x.id === id);

  if (!s) return;

  $("#modal-content").innerHTML = `
    <div class="detail-grid">

      <div>
        <span>Student ID</span>
        <strong>${escapeHTML(s.id)}</strong>
      </div>

      <div>
        <span>Full name</span>
        <strong>${escapeHTML(s.name)}</strong>
      </div>

      <div>
        <span>Email</span>
        <strong>${escapeHTML(s.email)}</strong>
      </div>

      <div>
        <span>Age</span>
        <strong>${s.age}</strong>
      </div>

      <div>
        <span>Course</span>
        <strong>${escapeHTML(s.course)}</strong>
      </div>

      <div>
        <span>Year level</span>
        <strong>${escapeHTML(s.year)}</strong>
      </div>

    </div>
  `;

  $("#student-modal").classList.remove("hidden");
}

// DELETE STUDENT
function deleteStudent(id) {
  if (!confirm(`Remove student ${id} from this sample directory?`)) {
    return;
  }

  students = students.filter(s => s.id !== id);

  renderStudents();
}

// CLOSE MODAL
$("#close-modal").addEventListener("click", () =>
  $("#student-modal").classList.add("hidden")
);

$("#student-modal").addEventListener("click", e => {
  if (e.target.id === "student-modal") {
    $("#student-modal").classList.add("hidden");
  }
});

// EXPORT STUDENT REPORT TO CSV
$("#export-report").addEventListener("click", () => {

  const rows = [
    ["Student ID", "Full name", "Email", "Age", "Course", "Year level"],

    ...students.map(s => [
      s.id,
      s.name,
      s.email,
      s.age,
      s.course,
      s.year
    ])
  ];

  const csv = rows.map(row =>
    row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], {
    type:"text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "student-enrollment-report.csv";
  a.click();

  URL.revokeObjectURL(url);
});

// INITIALIZE DIRECTORY
renderStudents();
