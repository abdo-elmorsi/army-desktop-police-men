import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDatabase } from '@/hooks';
import { Button, Error, Input } from '@/components';
import { formatComma } from '@/utils';
import { format } from 'date-fns';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';
import { FaBalanceScale } from 'react-icons/fa';
import debounce from 'lodash.debounce';

const PoliceMen = () => {
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: { data: policemen, pagination },
    fetchData,
    loading,
    error,
    deleteItem
  } = useDatabase(
    'policemen',
    null,
    [searchQuery, itemsPerPage, (currentPage - 1) * itemsPerPage]
  );
  console.log(policemen);

  const debouncedFetchData = useRef(debounce((query) => {
    fetchData(null, [query, itemsPerPage, (currentPage - 1) * itemsPerPage]);
  }, 1000)).current;

  const handleDelete = useCallback(async (id) => {
    const confirmationMessage = id ? 'هل انت متأكد من حذف هذه الحركه' : 'هل انت متأكد من حذف جميع الحركات';
    const isConfirmed = window.location.host.includes('vercel.app')
      ? window.confirm(confirmationMessage)
      : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

    if (isConfirmed) {
      await deleteItem(id);
      !id && fetchData(null, [null, 5, 0]);
    }
  }, [deleteItem]);

  const totalPages = pagination?.totalPages || 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedFetchData(query);
  };

  useEffect(() => {
    if (!loading) {
      fetchData(null, [searchQuery, itemsPerPage, (currentPage - 1) * itemsPerPage]);
    }
  }, [currentPage]);

  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <nav className="text-gray-700 dark:text-gray-300 mb-4">
        <ul className="list-reset flex">
          <li>
            <Link to="/policemen" className="text-primary hover:underline">المنتجات</Link>
          </li>
        </ul>
      </nav>

      <div className='flex justify-between items-center w-full'>
        <Link
          to={`/policemen/add`}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary mb-4 inline-block"
        >
          اضافه
        </Link>
      </div>


      <div className="mb-4 pe-7">
        <Input
          type="text"
          placeholder="ابحث بالأسم, رقم الرطة"
          className="p-2 w-96 border rounded-md"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="overflow-auto" style={{ height: '56vh' }}>
        <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-300 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-gray-800 dark:text-gray-300">#</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">الأسم</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">الدرجة</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">الرقم الشرطة</th>
              {/* <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الميلاد</th> */}
              {/* <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ التعيين</th> */}
              <th className="p-4 text-gray-800 dark:text-gray-300">محل الاقامة</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">العمل المسند اليه</th>
              {/* <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الانشاء</th> */}
              <th className="p-4 text-gray-800 dark:text-gray-300">الصورة</th>
              {/* <th className="p-4 text-gray-800 dark:text-gray-300">الوصف</th> */}
              <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableSkeleton key={index} />
              ))
            ) : (
              <>
                {policemen?.map((policeman, i) => (
                  <tr key={policeman.id}>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{policeman.username}</td>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{policeman.degree}</td>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{policeman.policeNo}</td>
                    {/* <td className="text-center p-4 text-gray-800 dark:text-gray-200">{format(new Date(policeman.birthDate), "yyyy-MM-dd")}</td> */}
                    {/* <td className="text-center p-4 text-gray-800 dark:text-gray-200">{format(new Date(policeman.joinDate), "yyyy-MM-dd")}</td> */}
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{policeman.address}</td>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{policeman.job}</td>
                    {/* <td className="text-center p-4 text-gray-800 dark:text-gray-200">{format(new Date(policeman.createdAt), "yyyy-MM-dd")}</td> */}
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">
                      {policeman.image ? (
                        <img src={policeman.image} alt={policeman.username} className="w-10 h-10 object-cover rounded-full m-0" />
                      ) : (
                        <span>لا يوجد صورة</span>
                      )}
                    </td>
                    {/* <td className="text-center p-4 text-gray-800 dark:text-gray-200">{policeman.description}</td> */}

                    <td className="p-4 flex justify-center gap-2">
                      <Button
                        disabled={loading}
                        onClick={() => navigate(`/policemen/edit/${policeman.id}`)}
                        className="bg-primary text-white flex items-center gap-2"
                      >
                        <BiEdit />
                        <span>تعديل</span>
                      </Button>
                      <Button
                        disabled={loading}
                        onClick={() => handleDelete(policeman.id)}
                        className="btn--red flex items-center gap-2"
                      >
                        <BiTrash />
                        <span>حذف</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center my-4 items-center">
        <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>السابق</Button>
        <span className="mx-4 dark:text-white">صفحة {currentPage} من {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>التالي</Button>
      </div>
    </div>
  );
};

const TableSkeleton = () => (
  <tr>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-12 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-32 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-24 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-24 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-24 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-24 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-32 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-24 mx-auto"></div>
    </td>
  </tr>
);

export default PoliceMen;
