<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Detail -
          {{
            catalogueData?.data?.value?.data?.unique_code ||
            catalogueData?.data?.value?.data?.name ||
            ""
          }}
        </span>
      </template>
    </el-page-header>

    <el-card class="my-3" v-if="catalogueData.status.value != 'pending'">
      <template #header>
        <div class="flex justify-end">
          <NuxtLink
            :disabled="loading"
            :loading="loading"
            :to="`/catalogue/add?unique_id=${catalogueData?.data?.value?.data?.unique_id}`"
            class="el-button el-button--warning"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <el-button
            v-if="!loading"
            type="danger"
            :disabled="loading"
            :loading="loading"
            :icon="Delete"
            @click="() => onDelete([catalogueData?.data?.value?.data?.unique_id!])"
            >Hapus</el-button
          >
        </div>
      </template>
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="small" border>
            <el-descriptions-item label="Nama Item">{{
              catalogueData?.data?.value?.data?.name
            }}</el-descriptions-item>
            <el-descriptions-item label="Brand">{{
              catalogueData?.data?.value?.data?.brand?.name || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Tahun">{{
              catalogueData?.data?.value?.data?.year || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Jenis Item">{{
              catalogueData?.data?.value?.data?.is_asset ? "Asset" : "Non-Asset"
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="flex-1">
          <el-descriptions title="" :column="1" size="small" border>
            <el-descriptions-item label="Serial Number">{{
              catalogueData?.data?.value?.data?.sn || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="Dibuat Pada">{{
              formatLocalDate(catalogueData?.data?.value?.data?.created_at ?? 0)
            }}</el-descriptions-item>
            <el-descriptions-item label="Terakhir Diupdate">{{
              formatLocalDate(catalogueData?.data?.value?.data?.updated_at ?? 0)
            }}</el-descriptions-item>
            <el-descriptions-item label="Bundle">{{
              catalogueData?.data?.value?.data?.is_bundle
                ? "Bundle"
                : "Non Bundle"
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <div class="mb-5">
        <h1 class="text-lg font-bold">Deskripsi</h1>
        <p>
          {{
            catalogueData?.data?.value?.data?.description ||
            "Tidak ada deskripsi"
          }}
        </p>
      </div>

      <div class="mb-5">
        <h1 class="text-lg font-bold">Dimensi</h1>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="Panjang">{{
            catalogueData?.data?.value?.data?.length
              ? `${catalogueData.data?.value?.data?.length} cm`
              : "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="Lebar">{{
            catalogueData?.data?.value?.data?.width
              ? `${catalogueData.data?.value?.data?.width} cm`
              : "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="Tinggi">{{
            catalogueData?.data?.value?.data?.height
              ? `${catalogueData.data?.value?.data?.height} cm`
              : "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="Berat">{{
            catalogueData?.data?.value?.data?.berat
              ? `${catalogueData.data?.value?.data?.berat} gram`
              : "-"
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="mb-5">
        <h1 class="text-lg font-bold">Lampiran</h1>
        <div class="flex flex-wrap gap-4">
          <el-image
            v-for="(file, index) in catalogueData?.data?.value?.data
              ?.file_catalogues"
            :key="index"
            :src="file.url"
            :preview-src-list="previewImageList"
            :initial-index="index"
            fit="cover"
            class="w-32 h-32 rounded-md border"
          >
            <template #error>
              <div
                class="w-full h-full flex items-center justify-center bg-gray-100"
              >
                <el-icon :size="30"><Document /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </el-card>

    <el-card class="mt-3" v-if="inventoryData?.status?.value != 'pending'">
      <h1 class="mb-4">Informasi Inventory</h1>

      <CustomTable
        :column-sort="onSort"
        :columns="filteredColumn"
        :data="inventoryData?.data.value?.data ?? []"
      />
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
          :total="inventoryData?.data.value?.total_data"
          @current-change="handlePageChangeInventory"
          @size-change="handleSizeChangeInventory"
          :page-count="inventoryData?.data.value?.total_page"
          size="small"
        />
      </div>
    </el-card>

    <el-card class="mt-3">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <h1>Informasi Subtitution</h1>
          <el-button type="primary" @click="openSubstitutionModal"
            >Tambah Subtitusi</el-button
          >
        </div>
      </template>

      <el-tree
        v-if="!loadingSubtitution"
        style="max-width: 600px"
        :data="existingSubstitutionSource"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :render-content="renderContent"
      />

      <!-- <CustomTable
        :column-sort="onSort"
        :columns="filteredColumn"
        :data="inventoryData?.data ?? []"
      />
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="inventoryData?.total_data"
          @next-click="paginationClick"
          @prev-click="paginationClick"
          @change="paginationClick"
        />
      </div> -->
    </el-card>
    <el-card class="mt-3" v-if="bundle_items?.status?.value != 'pending'">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <h1>Daftar Item Bundle</h1>
          <el-button type="primary" @click="openBundleModal"
            >Tambah Item Bundle</el-button
          >
        </div>
      </template>

      <CustomTable
        :columns="bundleColumns"
        :data="bundle_items?.data.value?.data ?? []"
        :loading="removingBundleId !== null"
      />
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
          :total="bundle_items?.data.value?.total_data ?? 0"
          :page-size="parseInt(bundle_request_search.limit)"
          :current-page="parseInt(bundle_request_search.offset)"
          @current-change="handlePageChangeBundle"
          @size-change="handleSizeChangeBundle"
          size="small"
        />
      </div>
    </el-card>
    <el-card class="mt-3">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <h1>Penawaran Harga</h1>
        </div>
      </template>

      <el-table
        :data="pricetag_item.data.value?.data ?? []"
        border
        @sort-change="onSortOffer"
      >
        <el-table-column
          prop="vendor_name"
          label="Vendor"
          class="mb-0"
          :sortable="true"
        >
          <template #default="scope">
            {{ scope.row.pricetag.owner?.name }}
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="Harga"
          class="mb-0"
          :sortable="true"
        >
          <template #default="scope">
            {{ currencyWithoutSymbol(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Deskripsi" class="mb-0">
          <template #default="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
          :total="pricetag_item?.data.value?.total_data"
          @current-change="handlePageChangeOffer"
          @size-change="handleSizeChangeOffer"
          :page-count="pricetag_item?.data.value?.total_page"
          size="small"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showSubstitutionModal"
      title="Pilih Subtitusi Catalogue"
      width="70%"
    >
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="subtitution_search.identitas"
            size="default"
            placeholder="Type to search"
          />
        </el-col>
      </el-row>
      <el-table
        :data="substitutionSource.data.value?.data ?? []"
        row-key="catalogue_id"
        border
      >
        <el-table-column type="expand">
          <template #default="scope">
            <div class="expand-wrapper mx-3">
              <el-tree
                ref="substitutionTreeRef"
                :data="substitutionTreeMap[scope.row.catalogue_id]"
                show-checkbox
                check-strictly
                node-key="id"
                :key="scope.row.catalogue_id"
                :props="defaultProps"
                @check="onTreeCheck"
              >
                <template #default="{ node, data }">
                  <!-- MODE INPUT SUBTITUSI BARU -->
                  <el-input
                    v-if="data.isNew"
                    v-model="
                      substitutionSource.data.value!.data[scope.$index]
                        .substitutions[node.parent?.childNodes.indexOf(node)]
                        .name
                    "
                    size="small"
                    placeholder="Nama subtitusi baru"
                  />

                  <!-- MODE NORMAL -->
                  <span v-else>
                    {{ data.label }}
                  </span>
                </template>
              </el-tree>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="catalogue_name" label="Nama Catalogue" />
        <el-table-column prop="sn" label="SN" />
        <el-table-column prop="brand_name" label="Brand" />
        <el-table-column label="Aksi" width="140" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="onAddNewSubstitution(scope.row.catalogue_id)"
            >
              Buat Baru
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="substitutionSource.data.value?.total_data ?? 0"
          :page-size="limit"
          :current-page="substitutionSource.data.value?.current_page ?? 1"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="onSubmitSubstitution">
            Simpan
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showBundleModal" title="Pilih Item Bundle" width="70%">
      <CatalogueSelect
        type="item"
        searchable
        :exclude-ids="bundleExcludeIds"
        @selection-change="(rows: Catalogue[]) => (selectedBundleCandidates = rows)"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBundleModal = false">Batal</el-button>
          <el-button
            type="primary"
            :loading="submittingBundle"
            @click="onSubmitBundleItems"
          >
            Simpan
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { NuxtLink } from "#components";
import {
  Download,
  Document,
  Filter,
  PictureFilled,
  SetUp,
  Plus,
} from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElImage,
  ElPopover,
  ElTag,
  ElTree,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { Inventory } from "~/types/inventory";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Unit } from "~/types/unit";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { Delete, Edit } from "@element-plus/icons-vue";
import type {
  CatalogueLite,
  CatalogueSubstitutionResponse,
  SubstitutionGroup,
  SubstitutionTreeNode,
} from "~/types/subtitution";
import type { Tree } from "element-plus/es/components/tree-v2/src/types.mjs";
import type {
  RenderContentContext,
  RenderContentFunction,
} from "element-plus/es/components/tree/src/tree.type.mjs";
import type { ColumnTable } from "~/types/ColumnTable";
import type { Pricetag_item } from "~/types/pricetag";
import { currencyWithoutSymbol } from "#imports";
import CatalogueSelect from "~/components/trums/CatalogueSelect.vue";

const { isMobile } = useDevice();

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "catalogues-read",
  name: "Detail Of Catalogues",
});

type Node = RenderContentContext["node"];
type Data = RenderContentContext["data"];

const router = useRouter();
const route = useRoute();
const goBack = () => router.back();

const popoverRef = ref();
const loading = ref(false);
const loadingSubtitution = ref<boolean>(false);
const loadingInventory = ref(false);
const catalogueData = await useAsyncData("catalogue-detail", async () => {
  const res = await useFetchApi<BaseResponse<Catalogue>>(
    `/catalogues-read/${route.params.id}`,
    "catalogue-detail",
    "get",
    null
  );
  return res.data.value;
});

const requestSearch = ref<RequestSearch>({
  column: [
    {
      catalogue_id: [route.params.id],
      location_id: [],
    },
  ],
  keyword: "",
  table: "inventories",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  offset: "1",
  limit: "10",
});

const inventoryData = await useAsyncData("search-inventory", async () => {
  const res = await useFetchApi<ResponsePagination<Inventory[]>>(
    `/search`,
    "search-inventory",
    "post",
    requestSearch.value
  );
  return res.data.value;
});

const bundle_request_search = ref<RequestSearch>({
  keyword: "",
  table: "catalogues",
  column: [
    {
      parent_id: [route.params.id],
    },
  ],
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  offset: "1",
  limit: "10",
});

const bundle_items = await useAsyncData("bundle-items", async () => {
  const res = await useFetchApi<ResponsePagination<Catalogue[]>>(
    `/search`,
    "bundle-items",
    "post",
    bundle_request_search.value
  );
  return res.data.value;
});

watch(
  () => bundle_request_search.value,
  () => bundle_items.refresh(),
  { deep: true }
);

const handlePageChangeBundle = (val: number) => {
  bundle_request_search.value.offset = val.toString();
};
const handleSizeChangeBundle = (val: number) => {
  bundle_request_search.value.limit = val.toString();
  bundle_request_search.value.offset = "1";
};

const showBundleModal = ref<boolean>(false);
const submittingBundle = ref<boolean>(false);
const removingBundleId = ref<string | null>(null);
const selectedBundleCandidates = ref<Catalogue[]>([]);

const openBundleModal = () => {
  selectedBundleCandidates.value = [];
  showBundleModal.value = true;
};

const bundleChildIds = computed<string[]>(() =>
  (bundle_items.data.value?.data ?? []).map((row) => row.unique_id ?? "")
);

const bundleExcludeIds = computed<string[]>(() => {
  const parentId = catalogueData.data.value?.data?.unique_id;
  return parentId ? [parentId, ...bundleChildIds.value] : bundleChildIds.value;
});

const buildBundlePayload = (row: Catalogue, parentId: string) => {
  const formData = new FormData();
  formData.append("unique_id", row.unique_id ?? "");
  formData.append("name", row.name ?? "");
  formData.append("type", row.type ?? "item");
  formData.append("sn", row.sn ?? "");
  formData.append("year", row.year ?? "");
  formData.append("brand_name", row.brand_name || row.brand?.name || "");
  if (row.brand_id) {
    formData.append("brand_id", row.brand_id);
  }
  formData.append("is_asset", `${row.is_asset ?? false}`);
  formData.append("parent_id", parentId);
  return formData;
};

const onSubmitBundleItems = async () => {
  const parentId = catalogueData.data.value?.data?.unique_id;
  if (!parentId) {
    ElMessage.error("Data catalogue induk belum termuat");
    return;
  }

  const candidates = selectedBundleCandidates.value.filter(
    (row) =>
      row.unique_id &&
      row.unique_id !== parentId &&
      !bundleChildIds.value.includes(row.unique_id)
  );

  if (candidates.length === 0) {
    ElMessage.warning("Pilih minimal satu item");
    return;
  }

  submittingBundle.value = true;
  let successCount = 0;
  let failedCount = 0;

  for (const row of candidates) {
    const response = await useFetchApi<BaseResponse<any>>(
      "/catalogues-create",
      "bundle-item-attach",
      "post",
      buildBundlePayload(row, parentId)
    );
    if (response.status.value === "success") {
      successCount++;
    } else {
      failedCount++;
    }
  }

  submittingBundle.value = false;

  if (successCount > 0) {
    ElMessage.success(`${successCount} item ditambahkan ke bundle`);
  }
  if (failedCount > 0) {
    ElMessage.error(`${failedCount} item gagal ditambahkan ke bundle`);
  }
  if (successCount > 0) {
    showBundleModal.value = false;
    selectedBundleCandidates.value = [];
    bundle_items.refresh();
  }
};

const removeBundleItem = async (row: Catalogue) => {
  if (!row.unique_id) return;

  try {
    await ElMessageBox.confirm(
      `Lepas "${row.name ?? "item"}" dari bundle ini?`,
      "Konfirmasi",
      {
        confirmButtonText: "Ya, Lepas",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );
  } catch {
    return; // user canceled
  }

  const parentId = catalogueData.data.value?.data?.unique_id;
  if (!parentId) {
    ElMessage.error("Data catalogue induk belum termuat");
    return;
  }

  removingBundleId.value = row.unique_id;
  const response = await useFetchApi<BaseResponse<any>>(
    "/catalogues-create",
    "bundle-item-detach",
    "post",
    buildBundlePayload(row, "")
  );
  removingBundleId.value = null;

  if (response.status.value === "success") {
    ElMessage.success("Item berhasil dilepas dari bundle");
    bundle_items.refresh();
  } else {
    ElMessage.error("Gagal melepas item dari bundle");
  }
};

const defaultProps = {
  children: "children",
  label: "label",
};

interface CurrentSubtitutionTree {
  unique_id?: string;
  label: string;
  type: "group" | "subtitution";
  subtitution_id?: string;
  children?: CurrentSubtitutionTree[];
}

const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);

const subtitution_search = ref<{
  identitas: string;
}>({
  identitas: "",
});
const current_subtitution_request = ref<{
  identitas: string;
}>({
  identitas: route.params.id as string,
});

const page_subtitution_search = ref<number>(1);
const limit = ref<number>(10);
const showSubstitutionModal = ref<boolean>(false);

const substitutionSource = await useFetchApi<
  ResponsePagination<CatalogueSubstitutionResponse[]>
>(
  `/find-subtitutions?page=${page_subtitution_search.value}&limit=${limit.value}`,
  "find-subtitutions",
  "post",
  subtitution_search.value
);
const existingSubstitutionSource = ref<CurrentSubtitutionTree[]>([]);

const pricetag_item_request_search = ref<RequestSearch>({
  keyword: "",
  table: "pricetag_item",
  column: [
    {
      catalogue_id: [route.params.id],
      pricetag: {
        category: ["penawaran"],
        type: ["in"],
      },
    },
  ],
  sort: {
    column: "created_at",
    order: "desc",
  },
  offset: "1",
  limit: "10",
});

const pricetag_item = await useAsyncData("pricetag-item", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/search`,
    "pricetag-item",
    "post",
    pricetag_item_request_search.value
  );
  return res.data.value;
});

const handleNodeClick = (data: Tree) => {
  console.log(data);
};

const handleSizeChange = (size: number) => {
  limit.value = size;
  // page_subtitution_search.value =
  refreshNuxtData("find-subtitutions");
};
const handleSizeChangeOffer = (size: number) => {
  pricetag_item_request_search.value.limit = size.toString();
};
const handlePageChange = (size: number) => {
  page_subtitution_search.value = size;
  refreshNuxtData("find-subtitutions");
};
const handlePageChangeOffer = (size: number) => {
  pricetag_item_request_search.value.offset = size.toString();
};

const onSortOffer = (value: any) => {
  pricetag_item_request_search.value.sort = {
    column: value.prop,
    order: value.order == "ascending" ? OrderColumn.ASC : OrderColumn.DESC,
  };
};

watch(
  () => pricetag_item_request_search.value,
  () => pricetag_item.refresh(),
  { deep: true }
);

const substitutionTreeData = ref<CatalogueSubstitutionResponse[]>([]);

// hasil pilihan user
const selectedSubstitutionIds = ref<string[]>([]);
const substitutionTreeRef = ref<InstanceType<typeof ElTree>>();
const onTreeCheck = (
  _: SubstitutionTreeNode,
  info: { checkedKeys: string[] }
) => {
  const index = selectedSubstitutionIds.value.findIndex(
    (value) => value === _.id
  );
  selectedSubstitutionIds.value = info.checkedKeys;
  console.log("selected", selectedSubstitutionIds.value);
};

const renderContent: RenderContentFunction = (h, { node, data }) => {
  return h(
    "div",
    {
      class: "custom-tree-node",
    },
    [
      h("span", null, node.label),
      h("div", null, [
        h(
          ElButton,
          {
            type: "danger",
            link: true,
            style: "margin-left: 4px",
            onClick: () => removeSubtitution(node, data),
          },
          {
            default: () => "Delete",
          }
        ),
      ]),
    ]
  );
};

const removeSubtitution = async (node: Node, data: Data) => {
  const subs = data as CurrentSubtitutionTree;

  await ElMessageBox.confirm("Yakin ingin menghapus Subtitusi?", "Warning", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  });

  if (subs.type == "subtitution") {
    submitRemoveSubtitution([subs.unique_id!]);
  }
};

const submitRemoveSubtitution = async (ids: string[]) => {
  loadingSubtitution.value = true;
  try {
    const response = await useFetchApi(
      "/catalogues-subtitutions-delete",
      "delete-subtitution",
      "post",
      ids
    );
    if (response.status.value === "success") {
      findExistingSubtitution();
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loadingSubtitution.value = false;
  }
};

// jika user pilih "buat baru"
const createNewSubstitution = ref<boolean>(false);
const newSubstitutionName = ref<string>("");
const newSubstitutionByCatalogue = ref<Record<string, string>>({});

const column_selected = ref<string[]>([
  "selection",
  "sn",
  "catalogue.name",
  "location.name",
  "quantity",
  "unit_name",
  "is_traceable",
  "setup",
]);

const availableColumn: ColumnTable<Inventory>[] = [
  {
    title: "Item",
    key: "catalogue.name",
    dataKey: "catalogue.name",
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <>{rowData.catalogue?.name}</>
    ),
  },
  {
    title: "Serial Number",
    key: "sn",
    dataKey: "sn",
    width: 200,
  },
  {
    title: "Location",
    key: "location.name",
    dataKey: "location.name",
    width: 200,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Location</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <el-checkbox-group
                    v-model={requestSearch.value.column![0].location_id}
                  >
                    {locations.value.map(
                      (location: Catalogue, index: number) => (
                        <ElCheckbox
                          key={location.unique_id ?? index}
                          value={location.unique_id ?? index}
                        >
                          {location.name}
                        </ElCheckbox>
                      )
                    )}
                  </el-checkbox-group>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
    cellRenderer: ({ rowData: row }) => (
      <>
        <NuxtLink
          class={`text-blue-600`}
          href={`/inventory-management/location/${
            row.location?.unique_id ?? ""
          }`}
        >
          {row.location?.name ?? "N/A"}
        </NuxtLink>
      </>
    ),
  },
  {
    title: "QTY",
    key: "quantity",
    dataKey: "quantity",
    sortable: true,
    width: 100,
    align: "center",
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{row.quantity}</p>
      </>
    ),
  },
  {
    title: "Satuan",
    key: "unit_name",
    dataKey: "unit_name",
    sortable: false,
    width: 100,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{row.unit_name}</p>
      </>
    ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Satuan</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <el-checkbox-group
                    v-model={requestSearch.value.column![0].unit_id}
                  >
                    {units.value.map((unit: Unit) => (
                      <ElCheckbox key={unit.unique_id!} value={unit.unique_id!}>
                        {unit.name}
                      </ElCheckbox>
                    ))}
                  </el-checkbox-group>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
  {
    title: "Traceable",
    key: "is_traceable",
    dataKey: "is_traceable",
    align: "center",
    width: 150,
    cellRenderer: ({ rowData: row }) =>
      row.is_traceable ? (
        <ElTag type="primary">{"Traceable"}</ElTag>
      ) : (
        <ElTag type="info">{"Non-Traceable"}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Traceable</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckbox
                    value={true}
                    v-model={requestSearch.value.column![0].is_traceable}
                  >
                    Traceable
                  </ElCheckbox>
                  <ElCheckbox
                    value={false}
                    v-model={requestSearch.value.column![0].is_traceable}
                  >
                    Not Traceable
                  </ElCheckbox>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },

  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

availableColumn[availableColumn.length - 1].headerCellRenderer = () => {
  const filters = availableColumn.filter(
    (value) => value.key != "selection" && value.key != "setup"
  );
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <el-checkbox-group v-model={column_selected.value}>
                  {filters.map((value) => (
                    <ElCheckbox
                      onChange={() => console.log("ok")}
                      value={value.key!.toString()}
                    >
                      {value.title}
                    </ElCheckbox>
                  ))}
                </el-checkbox-group>
              </div>
            </div>
          ),
          reference: () => (
            <ElIcon class="cursor-pointer">
              <SetUp />
            </ElIcon>
          ),
        }}
      </ElPopover>
    </div>
  );
};

availableColumn.unshift({
  key: "selection",
  width: 50,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },

  headerCellRenderer: () => {
    const _data = unref(inventoryData.data);
    const onChange = (value: CheckboxValueType) =>
      (inventoryData.data.value = {
        success: true,
        current_page: _data?.current_page ?? 0,
        total_data: _data?.total_data ?? 0,
        total_page: _data?.total_data ?? 0,
        data: _data?.data?.map((row: any) => {
          row.checked = value;
          return row;
        })!,
      });
    const allSelected = _data!.data.every((row) => row.checked);
    const containsChecked = _data?.data.some((row) => row.checked);

    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

const onDelete = async (uniques: string[]) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus Catalogue?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/catalogues-delete",
      "delete-catalogue",
      "post",
      uniques
    );
    if (response.status.value == "success") {
      ElMessage.success("Catalogue berhasil dihapus");
      goBack();
    }
  } catch (error) {
    // User canceled or error occurred
  }
};

const fetchLocation = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Catalogue[]>>(
      `/search`,
      "location",
      "post",
      {
        keyword: "",
        column: [
          {
            type: ["place"],
          },
        ],
        limit: "10",
        offset: "1",
        table: "catalogues",
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
      }
    );

    if (response.status.value == "success") {
      locations.value = (
        response.data.value as ResponsePagination<Catalogue[]>
      ).data;
      console.log(locations.value);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const bundleColumns: ColumnTable<Catalogue>[] = [
  {
    key: "image",
    title: "Gambar",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => {
      const image = getFirstFileUrl(rowData.files ?? []);
      return (
        <div class="flex items-center justify-center">
          {image ? (
            <ElImage
              src={image}
              fit="cover"
              style={{ width: "35px", height: "35px" }}
            />
          ) : (
            <div
              class="flex items-center justify-center border rounded"
              style={{ width: "35px", height: "35px", fontSize: "10px" }}
            >
              <ElIcon>
                <PictureFilled />
              </ElIcon>
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "unique_code",
    title: "Kode",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <NuxtLink
        href={`/catalogue/${rowData.unique_id}`}
        class={"text-blue-600"}
      >
        {rowData.unique_code}
      </NuxtLink>
    ),
  },
  {
    dataKey: "name",
    key: "name",
    title: "Nama",
    sortable: true,
  },
  {
    dataKey: "sn",
    key: "sn",
    title: "SN",
    width: 200,
  },
  {
    key: "brand_name",
    title: "Brand",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <p>{rowData.brand?.name ?? "N/A"}</p>
    ),
  },
  {
    key: "actions",
    title: "Aksi",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <ElButton
        size="small"
        type="danger"
        plain
        loading={removingBundleId.value === rowData.unique_id}
        onClick={() => removeBundleItem(rowData)}
      >
        Lepas
      </ElButton>
    ),
  },
];

const openSubstitutionModal = async (): Promise<void> => {
  showSubstitutionModal.value = true;
};

const buildSubstitutionTree = (
  substitutions: SubstitutionGroup[],
  catalogueId: string
): SubstitutionTreeNode[] => {
  const baseTree: SubstitutionTreeNode[] = substitutions.map((sub) => {
    if (sub.isNew) {
      return {
        id: `${catalogueId}-__new__`,
        label: sub.name,
        children: sub.catalogues.map((cat) => ({
          id: `${catalogueId}-${sub.subtitution_id}-${cat.catalogue_id}`,
          label: `${cat.catalogue_name} (${cat.brand_name})`,
          // disabled: true,
        })),
        isNew: sub.isNew ?? false,
      };
    } else {
      return {
        id: `${catalogueId}-${sub.subtitution_id}`,
        label: sub.name,
        children: sub.catalogues.map((cat) => ({
          id: `${catalogueId}-${sub.subtitution_id}-${cat.catalogue_id}`,
          label: `${cat.catalogue_name} (${cat.brand_name})`,
          // disabled: true,
        })),
        isNew: sub.isNew ?? false,
      };
    }
  });
  console.log("base tree", baseTree);
  return baseTree;
};

const substitutionTreeMap = computed(() => {
  const map: Record<string, SubstitutionTreeNode[]> = {};

  (substitutionSource.data.value?.data ?? []).forEach((row) => {
    map[row.catalogue_id] = buildSubstitutionTree(
      row.substitutions,
      row.catalogue_id
    );
  });

  return map;
});

const onAddNewSubstitution = (catalogueId: string): void => {
  const prevChecked = [...selectedSubstitutionIds.value];
  (substitutionSource.data.value?.data ?? []).forEach((element, index) => {
    if (element.catalogue_id === catalogueId) {
      element.substitutions.push({
        catalogues: [
          {
            brand_name: catalogueData.data.value?.data?.brand?.name ?? "",
            catalogue_id: catalogueData.data.value?.data?.unique_id ?? "",
            catalogue_name: catalogueData.data.value?.data?.name ?? "",
            sn: catalogueData.data.value?.data?.sn ?? "",
          },
        ],
        unique_id: `${Number(index) + 1}`,
        name: "",
        isNew: true,
      });
    }
  });
  nextTick(() => {
    substitutionTreeRef.value?.setCheckedKeys(prevChecked);
  });
};

const onSubmitSubstitution = async () => {
  try {
    if (!catalogueData.data.value?.data?.unique_id) return;

    const catalogueId = catalogueData.data.value?.data?.unique_id;

    const newSubstitutionName = newSubstitutionByCatalogue.value[catalogueId];

    let state = false;
    (substitutionSource.data.value?.data ?? []).forEach((element) => {
      element.substitutions.forEach((sub) => {
        if (sub.isNew && sub.name === "") {
          state = true;
          return;
        }
      });
    });

    const selectedExistingSubstitutionIds = selectedSubstitutionIds.value
      .filter((id) => !id.includes("__new__"))
      .map((id) => id.split("-")[1]);

    console.log(newSubstitutionName);

    // VALIDASI MINIMAL
    if (selectedExistingSubstitutionIds.length === 0 && state) {
      ElMessage.error("Pilih subtitusi atau buat subtitusi baru");
      return;
    }

    if (state) {
      ElMessage.error("Nama subtitusi baru wajib diisi");
      return;
    }

    const newSubtitutionPayload: {
      catalogue_id: string;
      name: string;
    }[] = [];

    (substitutionSource.data.value?.data ?? []).forEach((sub) => {
      sub.substitutions.forEach((element) => {
        if (element.isNew) {
          newSubtitutionPayload.push({
            catalogue_id: sub.catalogue_id,
            name: element.name,
          });
        }
      });
    });

    const payload = {
      catalogue_id: catalogueId,
      subtitution_id: selectedExistingSubstitutionIds,
      new: newSubtitutionPayload,
    };

    console.log("PAYLOAD SUBMIT", payload);

    const response = await useFetchApi(
      "/catalogues-subtitutions-create",
      "submit-subtituion",
      "post",
      payload
    );

    if (response.status.value === "success") {
      ElMessage.success("Subtitution berhasil di tambahkan");
    }

    // 👉 kirim ke backend di sini
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};

const handlePageChangeInventory = (val: number) => {
  requestSearch.value.offset = val.toString();
};
const handleSizeChangeInventory = (val: number) => {
  requestSearch.value.limit = val.toString();
};

const fetchUnits = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Unit[]>>(
      `/search`,
      "units",
      "post",
      {
        keyword: "",
        column: [],
        limit: "50",
        offset: "1",
        table: "units",
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
      }
    );

    if (response.status.value == "success") {
      units.value = (response.data.value as ResponsePagination<Unit[]>).data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

const onSort = (sortBy: SortBy) => {
  const data: RequestSearch = { ...requestSearch.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      requestSearch.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  requestSearch.value = data;
};

// Format tanggal lokal
const formatLocalDate = (timestamp: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Format currency
const formatCurrency = (value: number) => {
  if (!value) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// List gambar untuk preview
const previewImageList = computed(() => {
  return (
    catalogueData.data.value?.data?.file_catalogues
      ?.filter((file) => file.type === "image")
      ?.map((file) => file.url) || []
  );
});

watch(
  () => requestSearch,
  () => inventoryData.refresh(),
  { deep: true }
);

const findExistingSubtitution = async () => {
  loadingSubtitution.value = true;
  try {
    const response = await useFetchApi<
      ResponsePagination<CatalogueSubstitutionResponse[]>
    >(
      `/find-subtitutions?page=${page_subtitution_search.value}&limit=${limit.value}`,
      "find-subtitutions-current",
      "post",
      current_subtitution_request.value
    );

    if (
      response.status.value == "success" &&
      (response.data.value?.data ?? []).length > 0
    ) {
      const substitutionGroup: SubstitutionGroup[] =
        response.data.value!.data[0].substitutions ?? [];

      substitutionGroup.forEach((element) => {
        existingSubstitutionSource.value.push({
          unique_id: element.unique_id,
          label: element.name ?? "",
          type: "group",
          children: element.catalogues.map((catalogue) => ({
            unique_id: catalogue.unique_id ?? "",
            label: catalogue.catalogue_name ?? "",
            type: "subtitution",
            children: [],
          })),
        });
      });
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loadingSubtitution.value = false;
  }
};

onMounted(async () => {
  await fetchLocation();
  await fetchUnits();
  await findExistingSubtitution();
});
</script>

<style scoped>
.el-image {
  transition: all 0.3s ease;
}

.el-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.custom-tree-node) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
