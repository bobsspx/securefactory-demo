"use client";

import {
  FormEvent,
  useState,
} from "react";

type ProductionStatus =
  | "planned"
  | "running"
  | "paused"
  | "completed";

type ProductionRecord = {
  id: string;

  productionDate: string;

  lineCode: string;

  productName: string;

  plannedUnits: number;

  producedUnits: number;

  rejectedUnits: number;

  status:
    ProductionStatus;
};

type Props = {
  initialRecords:
    ProductionRecord[];

  canWrite:
    boolean;
};

type ProductionForm = {
  productionDate: string;

  lineCode: string;

  productName: string;

  plannedUnits: string;

  producedUnits: string;

  rejectedUnits: string;

  status:
    ProductionStatus;
};

function getLocalDate() {
  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
        60_000
    );

  return local
    .toISOString()
    .slice(0, 10);
}

function createEmptyForm():
ProductionForm {
  return {
    productionDate:
      getLocalDate(),

    lineCode: "",

    productName: "",

    plannedUnits: "",

    producedUnits: "0",

    rejectedUnits: "0",

    status:
      "planned",
  };
}

export default function
ProductionClient({
  initialRecords,
  canWrite,
}: Props) {
  const [
    records,
    setRecords,
  ] =
    useState(
      initialRecords
    );

  const [
    form,
    setForm,
  ] =
    useState<ProductionForm>(
      createEmptyForm
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  function setField<
    K extends keyof
      ProductionForm
  >(
    field: K,
    value:
      ProductionForm[K]
  ) {
    setForm(
      (current) => ({
        ...current,

        [field]:
          value,
      })
    );
  }

  function startEdit(
    record:
      ProductionRecord
  ) {
    if (!canWrite) {
      return;
    }

    setEditingId(
      record.id
    );

    setForm({
      productionDate:
        record.productionDate,

      lineCode:
        record.lineCode,

      productName:
        record.productName,

      plannedUnits:
        String(
          record.plannedUnits
        ),

      producedUnits:
        String(
          record.producedUnits
        ),

      rejectedUnits:
        String(
          record.rejectedUnits
        ),

      status:
        record.status,
    });

    setMessage("");
  }

  function resetForm() {
    setEditingId(
      null
    );

    setForm(
      createEmptyForm()
    );
  }

  async function
  submitProduction(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const payload = {
      productionDate:
        form.productionDate,

      lineCode:
        form.lineCode,

      productName:
        form.productName,

      plannedUnits:
        Number(
          form.plannedUnits
        ),

      producedUnits:
        Number(
          form.producedUnits
        ),

      rejectedUnits:
        Number(
          form.rejectedUnits
        ),

      status:
        form.status,
    };

    const url =
      editingId
        ? `/api/admin/production/records/${editingId}`
        : "/api/admin/production/records";

    const method =
      editingId
        ? "PATCH"
        : "POST";

    setSaving(true);

    setMessage("");

    try {
      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        setMessage(
          data.error ||
          "Unable to save production record."
        );

        return;
      }

      const saved:
        ProductionRecord =
          data.record;

      if (editingId) {
        setRecords(
          (current) =>
            current.map(
              (record) =>
                record.id ===
                saved.id

                  ? saved

                  : record
            )
        );

        setMessage(
          `${saved.lineCode} updated successfully.`
        );
      } else {
        setRecords(
          (current) => [
            saved,
            ...current,
          ]
        );

        setMessage(
          `${saved.lineCode} created successfully.`
        );
      }

      resetForm();
    } catch {
      setMessage(
        "Unable to connect to the server."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="productionManagement"
    >
      <div
        className="productionHeading"
      >
        <div>
          <p>
            PRODUCTION DATA
          </p>

          <h2>
            Production records
          </h2>
        </div>

        <span>
          {records.length}
          {" "}records
        </span>
      </div>

      {canWrite && (
        <form
          className="productionForm"
          onSubmit={
            submitProduction
          }
        >
          <div
            className="productionFormHeader"
          >
            <div>
              <p>
                {editingId
                  ? "EDIT RECORD"
                  : "NEW RECORD"}
              </p>

              <h3>
                {editingId
                  ? "Update production"
                  : "Add production"}
              </h3>
            </div>

            {editingId && (
              <button
                type="button"
                className="productionCancel"
                onClick={
                  resetForm
                }
              >
                Cancel edit
              </button>
            )}
          </div>

          <div
            className="productionFormGrid"
          >
            <label>
              Date

              <input
                type="date"
                required
                value={
                  form.productionDate
                }
                onChange={
                  (event) =>
                    setField(
                      "productionDate",
                      event.target.value
                    )
                }
              />
            </label>

            <label>
              Line

              <input
                type="text"
                required
                maxLength={30}
                placeholder="LINE-05"
                value={
                  form.lineCode
                }
                onChange={
                  (event) =>
                    setField(
                      "lineCode",
                      event.target.value
                    )
                }
              />
            </label>

            <label>
              Product

              <input
                type="text"
                required
                maxLength={150}
                placeholder="Industrial Part"
                value={
                  form.productName
                }
                onChange={
                  (event) =>
                    setField(
                      "productName",
                      event.target.value
                    )
                }
              />
            </label>

            <label>
              Planned units

              <input
                type="number"
                min="1"
                step="1"
                required
                value={
                  form.plannedUnits
                }
                onChange={
                  (event) =>
                    setField(
                      "plannedUnits",
                      event.target.value
                    )
                }
              />
            </label>

            <label>
              Produced units

              <input
                type="number"
                min="0"
                step="1"
                required
                value={
                  form.producedUnits
                }
                onChange={
                  (event) =>
                    setField(
                      "producedUnits",
                      event.target.value
                    )
                }
              />
            </label>

            <label>
              Rejected units

              <input
                type="number"
                min="0"
                step="1"
                required
                value={
                  form.rejectedUnits
                }
                onChange={
                  (event) =>
                    setField(
                      "rejectedUnits",
                      event.target.value
                    )
                }
              />
            </label>

            <label>
              Status

              <select
                value={
                  form.status
                }
                onChange={
                  (event) =>
                    setField(
                      "status",
                      event.target.value as ProductionStatus
                    )
                }
              >
                <option value="planned">
                  Planned
                </option>

                <option value="running">
                  Running
                </option>

                <option value="paused">
                  Paused
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </label>

            <button
              type="submit"
              className="productionSave"
              disabled={
                saving
              }
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update record"
                  : "Create record"}
            </button>
          </div>
        </form>
      )}

      {!canWrite && (
        <div
          className="productionReadOnly"
        >
          VIEW-ONLY ACCESS —
          This account can read
          production records but
          cannot modify them.
        </div>
      )}

      {message && (
        <div
          className="productionMessage"
        >
          {message}
        </div>
      )}

      <div
        className="productionTable"
      >
        <div
          className="
            productionRow
            productionTableHead
          "
        >
          <span>DATE</span>
          <span>LINE</span>
          <span>PRODUCT</span>
          <span>PLANNED</span>
          <span>PRODUCED</span>
          <span>REJECTED</span>
          <span>STATUS</span>

          {canWrite && (
            <span>ACTION</span>
          )}
        </div>

        {records.length === 0 ? (
          <div
            className="productionEmpty"
          >
            No production records.
          </div>
        ) : (
          records.map(
            (record) => (
              <div
                className="productionRow"
                key={record.id}
              >
                <span>
                  {record.productionDate}
                </span>

                <strong>
                  {record.lineCode}
                </strong>

                <span>
                  {record.productName}
                </span>

                <span>
                  {record.plannedUnits
                    .toLocaleString()}
                </span>

                <span>
                  {record.producedUnits
                    .toLocaleString()}
                </span>

                <span>
                  {record.rejectedUnits
                    .toLocaleString()}
                </span>

                <span
                  className={`productionStatus productionStatus-${record.status}`}
                >
                  {record.status
                    .toUpperCase()}
                </span>

                {canWrite && (
                  <button
                    type="button"
                    className="productionEdit"
                    onClick={
                      () =>
                        startEdit(
                          record
                        )
                    }
                  >
                    Edit
                  </button>
                )}
              </div>
            )
          )
        )}
      </div>
    </section>
  );
}