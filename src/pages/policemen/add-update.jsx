import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelect, useDatabase, useInput } from '@/hooks';
import { Select, Button, Input, CustomDatePicker } from '@/components';
import { format } from 'date-fns';
import { convertImageToBase64 } from '@/utils';
const base64Image = `data:image/jpeg;base64,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`

const PoliceMenForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log(id);

  const { data: policemen, addItem, loading, updateItem } = useDatabase('policemen', id);


  const username = useInput("", null);
  const degree = useInput("", null);
  const policeNo = useInput("", null);
  const birthDate = useInput("", null);
  const joinDate = useInput("", null);
  const address = useInput("", null);
  const job = useInput("", null);
  const image = useInput("", null);
  const description = useInput("", null);




  const updateImage = async (e) => {
    console.log(e.target.files);
    console.log(e.target.files[0]);

    if (e.target.files[0]) {
      try {
        const base64String = await convertImageToBase64(e.target.files[0]);
        console.log({ base64String });

        image.changeValue(base64String)
      } catch (error) {
        console.log(error.message);
      }
    }
  }
  console.log(image);


  useEffect(() => {
    if (id && !loading) {
      (async () => {

        if (policemen) {
          username.changeValue(policemen.username);
          degree.changeValue(policemen.degree);
          policeNo.changeValue(policemen.policeNo);
          birthDate.changeValue(policemen.birthDate);
          joinDate.changeValue(policemen.joinDate);
          address.changeValue(policemen.address);
          job.changeValue(policemen.job);
          image.changeValue(policemen.image);
          description.changeValue(policemen.description);
        }
      })()
    }
  }, [id, loading]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = [
      username.value,
      degree.value,
      policeNo.value,
      birthDate ? format(birthDate.value, "yyyy-MM-dd") : null,
      joinDate ? format(joinDate.value, "yyyy-MM-dd") : null,
      address.value,
      job.value,
      image.value || base64Image,
      description.value
    ]

    if (id) {
      await updateItem(parseInt(id), data);
    } else {
      await addItem(data);
    }
    navigate('/policemen');
  };



  if ((loading) && id) {
    return (
      <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-6"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/5 mb-14"></div>
        <div className='flex justify-between items-center flex-wrap gap-8'>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 ">
      <nav className="text-gray-700 dark:text-gray-300 mb-4">
        <ul className="list-reset flex">
          <li>
            <Link to="/policemen" className="text-primary hover:underline">
              الأفراد
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className={id ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
            {id ? 'تعديل' : 'أضافه'}
          </li>
        </ul>
      </nav>
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
        {id ? 'تعديل' : 'أضافه'}
      </h1>
      <form className='mt-10'>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
          <Input
            mandatory
            label={"اسم الفرد"}
            {...username.bind}
            name="userName"
          />

          <Input
            mandatory
            label={"الدرجة"}
            {...degree.bind}
            name="degree"
          />

          <Input
            mandatory
            label={"رقم الشرطة"}
            {...policeNo.bind}
            name="policeNo"
          />

          <CustomDatePicker
            label="تاريخ الميلاد"
            value={birthDate.value}
            onChange={date => birthDate.changeValue(date)}
            maxDate={new Date()}
          />

          <CustomDatePicker
            label="تاريخ التعيين"
            value={joinDate.value}
            onChange={date => joinDate.changeValue(date)}
            maxDate={new Date()}
          />

          <Input
            mandatory
            label={"محل الاقامة"}
            {...address.bind}
            name="address"
          />

          <Input
            mandatory
            label={"العمل المسند اليه"}
            {...job.bind}
            name="job"
          />

          <Input
            label={"تفاصيل"}
            {...description.bind}
            name="description"
          />

          <label for="image-1" className=' flex justify-center items-center gap-2' >
            <img
              alt={"user_username"}
              src={image.value || base64Image}
              className="h-14 w-14 object-cover rounded-full"
            />
            <p className='dark:text-white'>اضغط للتغيير</p>
          </label>
          <Input
            className="hidden"
            id="image-1"
            type={"file"}
            // label={<img
            //   alt={"user_username"}
            //   src={image.value || base64Image}
            //   className="h-10 w-10 rounded-full"
            // />}
            onChange={(e) => updateImage(e)}
            name="image"
          />



        </div>

        <div className='flex items-center justify-end gap-10'>
          <Button className="btn--red w-36" onClick={() => {
            navigate('/policemen');
          }}>
            ألغاء
          </Button>
          <Button className="btn--primary w-36" disabled={
            !username.value ||
            !degree.value ||
            !policeNo.value ||
            !birthDate.value ||
            !joinDate.value ||
            !address.value ||
            !job.value ||
            loading
          } onClick={handleSubmit}>
            حفظ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PoliceMenForm;
